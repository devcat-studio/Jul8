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
                .Where(x => x.GetAttributeValue("data-templateId", null) != null);

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
                ? "data-templateId"
                : "data-listItemId";
            template.TemplateId = templateNode.Attributes[attrName].Value;
            template.ClassName = namePrefix + template.TemplateId;

            var childNodes = templateNode.SelectNodes(".//*");
            if (childNodes != null)
            {
                var listItemNodes = childNodes.Where(x => x.GetAttributeValue("data-listItemId", null) != null);
                foreach (var node in listItemNodes)
                {
                    node.Remove(); // 지금 떼어놔야 바로 다음에 컨트롤 검색에서 빠진다.
                    template.ListItems.Add(ParseTemplate(node, template.ClassName + "_"));
                }
            }

            // data-listItemId 붙은 것들을 뗀 상태에서 다시 검색한다
            childNodes = templateNode.SelectNodes(".//*");
            if (childNodes != null)
            {
                var controlNodes = childNodes.Where(x => x.GetAttributeValue("data-controlId", null) != null);
                foreach (var controlNode in controlNodes)
                {
                    var controlId = controlNode.Attributes["data-controlId"].Value; ;
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
            sb.AppendFormat("class {0}_d", template.ClassName);

            using (sb.Indent("{", "}"))
            {
                sb.AppendLine("tmpl: Jul8.TemplateInstance;");
                foreach (var controlId in template.Controls)
                {
                    sb.AppendLine(controlId + ": JQuery;");
                }
                foreach (var listItem in template.ListItems)
                {
                    sb.AppendFormat("listOf{0}: {1}_d[];", listItem.TemplateId, listItem.ClassName);
                }
                sb.AppendLine();

                // 생성자
                if (isRoot)
                {
                    sb.AppendLine("constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)");
                }
                else
                {
                    sb.AppendLine("constructor(t: Jul8.TemplateInstance)");
                }
                using (sb.Indent("{", "}"))
                {
                    if (isRoot)
                    {
                        sb.AppendFormat("let t = templateHolder.create('{0}');", template.TemplateId);
                        sb.AppendLine("if (parentNode) { parentNode.append(t.root()); }");
                    }
                    else
                    {
                        // nothing to write
                    }
                    sb.AppendLine("this.tmpl = t;");

                    foreach (var controlId in template.Controls)
                    {
                        sb.AppendFormat("this.{0} = t.C('{0}');", controlId);
                    }
                }

                // 리스트
                foreach (var listItem in template.ListItems)
                {
                    sb.AppendLine();
                    sb.AppendFormat("add{0}(): {1}_d", listItem.TemplateId, listItem.ClassName);
                    using (sb.Indent("{", "}"))
                    {
                        sb.AppendFormat("let t = this.tmpl.addListItem('{0}');", listItem.TemplateId);
                        sb.AppendFormat("let child = new {0}_d(t);", listItem.ClassName);
                        sb.AppendFormat("this.listOf{0}.push(child);", listItem.TemplateId);
                        sb.AppendLine("return child;");
                    }

                    sb.AppendLine();
                    sb.AppendFormat("remove{0}(child: {1}_d): void", listItem.TemplateId, listItem.ClassName);
                    using (sb.Indent("{", "}"))
                    {
                        sb.AppendFormat("let idx = this.listOf{0}.indexOf(child);", listItem.TemplateId);
                        sb.AppendFormat("if (idx >= 0)");
                        using (sb.Indent("{", "}"))
                        {
                            sb.AppendFormat("this.listOf{0}.splice(idx, 1);", listItem.TemplateId);
                            sb.AppendLine("child.tmpl.root().remove();");
                        }
                    }
                }
            }
            sb.AppendLine("");

            foreach (var item in template.ListItems)
            {
                GenerateClass(sb, item, false);
            }
        }
    }
}
