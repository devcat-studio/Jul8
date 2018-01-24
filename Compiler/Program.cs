using HtmlAgilityPack;
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
            if (args.Length < 2)
            {
                Console.WriteLine("usage: Jul8Compiler.exe <INPUT_FILE> <OUTPUT_FILE>");
                Environment.Exit(1);
            }

            var content = File.ReadAllText(args[0]);

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

            // 코드젠
            CodeBuilder sb = new CodeBuilder();
            sb.AppendLine("namespace Silvervine");
            using (sb.Indent("{", "}"))
            {
                foreach (var template in templates)
                {
                    GenerateClass(sb, template);
                }
            }

            File.WriteAllText(args[1], sb.ToString());
        }

        static void GenerateClass(CodeBuilder sb, Elements.Template template)
        {
            sb.AppendFormat("export class {0}_d", template.Id);
            using (sb.Indent("{", "}"))
            {
                sb.AppendLine("root: JQuery;");
                foreach (var control in template.Controls)
                {
                    sb.AppendLine(control.Id + ": JQuery;");
                }
                sb.AppendLine();

                sb.AppendLine("constructor(templateHolder: TemplateHolder, parentNode?: JQuery)");
                using (sb.Indent("{", "}"))
                {
                    sb.AppendFormat("let t = templateHolder.create('{0}');\n", template.Id);
                    sb.AppendLine("this.root = t.root();");
                    sb.AppendLine("if (parentNode) { parentNode.append(this.root); }");
                    sb.AppendLine();

                    foreach (var control in template.Controls)
                    {
                        sb.AppendFormat("this.{0} = t.C('{0}');", control.Id);
                        sb.AppendLine();
                    }
                }
            }
            sb.AppendLine("");
        }
    }
}
