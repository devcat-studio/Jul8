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

        static List<Elements.Template> ParseHtml(string path)
        {
            var content = File.ReadAllText(path);
            var doc = new HtmlDocument();
            doc.LoadHtml(content);

            List<Elements.Template> templates = new List<Elements.Template>();
            var rootNode = doc.DocumentNode.SelectSingleNode("//body/div");
            var templateNodes = doc.DocumentNode.SelectNodes("//*").Where(x => x.GetAttributeValue("data-templateId", null) != null);

            // template안에 template이 있는 경우 루트로 옮겨준다.
            // 미리보기를 위해서 그렇게 정의되어 있는거지 실제로 자식노드 처럼 처리하면 controlId 같은것이 중복 파싱되는 문제가 생김
            foreach (var templateNode in templateNodes)
            {
                var parent = templateNode.ParentNode;
                while (parent != null)
                {
                    if (parent.Attributes.Contains("data-templateId") == true)
                    {
                        templateNode.Remove();
                        rootNode.AppendChild(templateNode);
                        break;
                    }

                    parent = parent.ParentNode;
                }
            }

            foreach (var templateNode in templateNodes)
            {
                var template = new Elements.Template();
                template.Id = templateNode.Attributes["data-templateId"].Value;

                // 콘트롤을 찾아보자
                var childNodes = templateNode.SelectNodes(".//*");
                if (childNodes != null)
                {
                    var controlNodes = childNodes.Where(x => x.GetAttributeValue("data-controlId", null) != null);
                    foreach (var controlNode in controlNodes)
                    {
                        var control = new Elements.Control();
                        var controlId = controlNode.Attributes["data-controlId"].Value; ;

                        control.Id = controlId;

                        template.Controls.Add(control);
                    }
                }
                
                templates.Add(template);
            }

            return templates;
        }

        static void GenerateTypeScript(ConfigRoot config, List<Elements.Template> templates, string path)
        {
            CodeBuilder sb = new CodeBuilder();
            foreach (var ln in config.header)
            {
                sb.AppendLine(ln);
            }

            foreach (var template in templates)
            {
                GenerateClass(sb, template);
            }

            foreach (var ln in config.footer)
            {
                sb.AppendLine(ln);
            }
            sb.WriteToFile(path);
        }

        static void GenerateClass(CodeBuilder sb, Elements.Template template)
        {
            sb.AppendFormat("class {0}_d", template.Id);
            using (sb.Indent("{", "}"))
            {
                sb.AppendLine("root: JQuery;");
                foreach (var control in template.Controls)
                {
                    sb.AppendLine(control.Id + ": JQuery;");
                }
                sb.AppendLine();

                sb.AppendLine("constructor(templateHolder: Jul8.TemplateHolder, parentNode?: JQuery)");
                using (sb.Indent("{", "}"))
                {
                    sb.AppendFormat("let t = templateHolder.create('{0}');", template.Id);
                    sb.AppendLine("this.root = t.root();");
                    sb.AppendLine("if (parentNode) { parentNode.append(this.root); }");

                    foreach (var control in template.Controls)
                    {
                        sb.AppendFormat("this.{0} = t.C('{0}');", control.Id);
                    }
                }
            }
            sb.AppendLine("");
        }
    }
}
