using HtmlAgilityPack;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace Jul8Compiler
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 1)
            {
                Console.WriteLine("usage: Jul8Compiler.exe <JUL8CONFIG.JSON>");
                Environment.Exit(1);
            }

            var configContent = File.ReadAllText(args[0]);
            var config = JsonConvert.DeserializeObject<ConfigRoot>(configContent);

            var dir = Path.GetDirectoryName(args[0]);

            foreach (var item in config.build)
            {
                var sourcePath = Path.Combine(dir, item.source);
                var targetPath = Path.Combine(dir, item.target);

                var templates = ParseHtml(sourcePath);
                GenerateTypeScript(config, templates, targetPath);
            }
        }

        static List<Template> ParseHtml(string path)
        {
            var content = File.ReadAllText(path);
            var doc = new HtmlDocument();
            doc.LoadHtml(content);

            List<Template> templates = new List<Template>();

            var rootNode = doc.DocumentNode.SelectSingleNode("//body/div");
            var templateNodes = doc.DocumentNode
                .SelectNodes("//*")
                .Where(x => x.GetAttributeValue("j8-template", null) != null);

            // template들을 트리에서 뗀다.
            // 그대로 둔 상태로 처리하면 템플릿 안에 템플릿이 들어있을 때
            // controlId 같은것이 중복 파싱되는 문제가 생긴다.
            foreach (var templateNode in templateNodes)
            {
                templateNode.Remove();
            }

            foreach (var templateNode in templateNodes)
            {
                templates.Add(ParseTemplate(templateNode, ""));
            }

            return templates;
        }

        static Template ParseTemplate(HtmlNode templateNode, string namePrefix)
        {
            var template = new Template();
            var attrName = (namePrefix == "")
                ? "j8-template"
                : "j8-listItem";
            template.TemplateId = templateNode.Attributes[attrName].Value;
            template.ClassName = namePrefix + template.TemplateId;
            template.ModelName = templateNode.Attributes["j8-model"]?.Value;

            var childNodes = templateNode.SelectNodes(".//*");
            if (childNodes != null)
            {
                var listItemNodes = childNodes.Where(x => x.GetAttributeValue("j8-listItem", null) != null);
                foreach (var node in listItemNodes)
                {
                    node.Remove(); // 지금 떼어놔야 바로 다음에 컨트롤 검색에서 빠진다.
                    template.ListItems.Add(ParseTemplate(node, template.ClassName + "_"));
                }
            }

            // j8-listItem 붙은 것들을 뗀 상태에서 다시 검색한다
            childNodes = templateNode.SelectNodes(".//*");
            if (childNodes != null)
            {
                var controlNodes = childNodes.Where(x => x.GetAttributeValue("j8-control", null) != null);
                foreach (var controlNode in controlNodes)
                {
                    var controlId = controlNode.Attributes["j8-control"].Value; ;
                    template.Controls.Add(controlId);
                }
            }

            return template;
        }

        static void GenerateTypeScript(ConfigRoot config, List<Template> templates, string path)
        {
            CodeBuilder sb = new CodeBuilder();
            foreach (var ln in config.header)
            {
                sb.AppendLine(ln);
            }

            foreach (var template in templates)
            {
                GenerateClass(sb, template, true);
            }

            foreach (var ln in config.footer)
            {
                sb.AppendLine(ln);
            }
            sb.WriteToFile(path);
        }

        static void GenerateClass(CodeBuilder sb, Template template, bool isRoot)
        {
            sb.AppendFormat("class {0}_d implements Jul8.Element", template.ClassName);

            using (sb.Indent("{", "}"))
            {
                sb.AppendLine("$: JQuery;");
                foreach (var controlId in template.Controls)
                {
                    sb.AppendLine(controlId + ": JQuery;");
                }
                foreach (var listItem in template.ListItems)
                {
                    sb.AppendFormat("listOf_{0}: Jul8.ElementList<{1}_d>;", listItem.TemplateId, listItem.ClassName);
                }
                sb.AppendLine();

                // 생성자
                if (isRoot)
                {
                    sb.AppendLine("constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)");
                }
                else
                {
                    sb.AppendLine("constructor($: JQuery)");
                }
                using (sb.Indent("{", "}"))
                {
                    if (isRoot)
                    {
                        sb.AppendFormat("this.$ = templateHolder.cloneTemplate('{0}');", template.TemplateId);
                        sb.AppendLine("if (parentNode) { parentNode.append(this.$); }");
                    }
                    else
                    {
                        sb.AppendLine("this.$ = $;");
                    }
                    sb.AppendLine("let s = new Jul8.Scanner(this.$);");
                    sb.AppendLine("this.j8AttrsAndElems = s.attrsAndElems;");

                    foreach (var controlId in template.Controls)
                    {
                        sb.AppendFormat("this.{0} = s.C('{0}');", controlId);
                    }

                    foreach (var listItem in template.ListItems)
                    {
                        sb.AppendFormat("this.listOf_{0} = s.L<{1}_d>('{0}');", listItem.TemplateId, listItem.ClassName);
                    }
                }
                sb.AppendLine("");
                sb.AppendLine("private j8AttrsAndElems: Jul8.AttrsAndElems;");
                sb.AppendFormat("set(data: {0}): void {{ this.j8AttrsAndElems.set(data); }}", template.ModelName ?? "any");
            }
            sb.AppendLine("");

            foreach (var item in template.ListItems)
            {
                GenerateClass(sb, item, false);
            }
        }
    }
}
