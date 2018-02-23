using HtmlAgilityPack;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

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

            try
            {
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
            catch (Exception e)
            {
                Console.WriteLine(e.ToString());
                Environment.Exit(1);
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

            ScanListItems(template, templateNode);

            // j8-listItem 붙은 것들을 뗀 상태에서 다시 검색한다
            var childNodes = templateNode.SelectNodes(".//*");
            if (childNodes != null)
            {
                var controlNodes = childNodes.Where(x => x.GetAttributeValue("j8-control", null) != null);
                foreach (var controlNode in controlNodes)
                {
                    var controlId = controlNode.Attributes["j8-control"].Value; ;
                    template.Controls.Add(controlId);
                }

                foreach (var node in childNodes)
                {
                    CheckNode(template, node);
                }
            }

            CheckNode(template, templateNode);

            return template;
        }

        static void ScanListItems(Template template, HtmlNode baseNode)
        {
            if (!baseNode.HasChildNodes) { return; }

            // 순회 중 컨테이너 변경이 일어나기 때문에 ToArray로 한번 복사해서 순회
            foreach (var node in baseNode.ChildNodes.ToArray())
            {
                if (node.Attributes.Contains("j8-listItem"))
                {
                    node.Remove(); // 지금 떼어놔야 바로 다음에 컨트롤 검색에서 빠진다.
                    template.ListItems.Add(ParseTemplate(node, template.ClassName + "_"));
                }
                else
                {
                    ScanListItems(template, node);
                }
            }
        }

        static void CheckNode(Template template, HtmlNode node)
        {
            var textMatched = pattern.Matches(node.InnerText);
            foreach (var m in textMatched)
            {
                ParseAndAddField(template, m.ToString());
            }

            foreach (var a in node.Attributes)
            {
                var attrMatched = pattern.Matches(a.Value);
                foreach (var m in attrMatched)
                {
                    ParseAndAddField(template, m.ToString());
                }
            }
        }

        static void ParseAndAddField(Template template, string matched)
        {
            var fname = matched.Substring(2, matched.Length - 4).Trim();
            template.Fields.Add(fname);
        }

        static Regex pattern = new Regex("({{[^}]+}})");

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
            bool useModel = (template.Fields.Count > 0 || template.ModelName != null);

            sb.AppendFormat("class {0}_d implements Jul8.View", template.ClassName);
            using (sb.Indent("{", "}"))
            {
                sb.AppendLine("$: JQuery;");
                foreach (var controlId in template.Controls)
                {
                    sb.AppendLine(controlId + ": JQuery;");
                }
                foreach (var listItem in template.ListItems)
                {
                    sb.AppendFormat("listOf_{0}: Jul8.ViewList<{1}_d>;", listItem.TemplateId, listItem.ClassName);
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
                    sb.AppendFormat("let s = new Jul8.Scanner(this.$, {0});", (useModel ? "true" : "false"));
                    if (useModel)
                    {
                        sb.AppendLine("this.j8fields = s.fields;");
                    }

                    foreach (var controlId in template.Controls)
                    {
                        sb.AppendFormat("this.{0} = s.C('{0}');", controlId);
                    }

                    foreach (var listItem in template.ListItems)
                    {
                        sb.AppendFormat("this.listOf_{0} = s.L<{1}_d>('{0}');", listItem.TemplateId, listItem.ClassName);
                    }
                }

                if (template.Fields.Count > 0 || template.ModelName != null)
                {
                    sb.AppendLine("");
                    sb.AppendLine("private j8fields: Jul8.Fields;");
                    sb.AppendFormat("set(data: {0}): void", template.ModelName ?? "any");
                    using (sb.Indent("{", "}"))
                    {
                        if (template.ModelName != null)
                        {
                            foreach (var f in template.Fields)
                            {
                                sb.AppendFormat("data.{0};", f);
                            }
                        }
                        sb.AppendLine("this.j8fields.set(data);");
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
