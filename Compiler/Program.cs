using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace TemplateParser
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length < 2)
            {
                Console.WriteLine("usage: TemplateParser.exe <INPUT_FILE> <OUTPUT_FILE>");
                Environment.Exit(1);
            }

            bool backOfficeMode = (args.Length >= 3) && (args[2] == "backOfficeMode");

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
                while(parent != null)
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
                //Console.WriteLine(template.Id);
            }

            // 코드젠

            StringBuilder sb = new StringBuilder();
            if (backOfficeMode)
            {
                sb.AppendLine("namespace Silvervine { ");
            }
            else
            {
                sb.AppendLine("namespace devCAT { ");
            }
            foreach (var template in templates)
            {
                if (backOfficeMode)
                {
                    sb.AppendFormat("\texport class {0} {{", template.Id + "_d");
                    sb.AppendLine();
                    sb.AppendLine("\t\troot: JQuery;");
                }
                else
                {
                    sb.AppendFormat("\texport class {0} implements AppElement {{", template.Id + "_d");
                    sb.AppendLine();
                    sb.AppendLine("\t\thtml: JQuery;");
                }

                // 여기서 콘트롤 목록 생성
                foreach (var control in template.Controls)
                {
                    sb.AppendLine("\t\t" + control.Id + ": JQuery;");
                }

                sb.AppendLine();

                if (backOfficeMode)
                {
                    sb.AppendLine("\t\tconstructor(templateHolder: TemplateHolder, parentNode?: JQuery) {");
                    sb.AppendFormat("\t\t\tlet t = templateHolder.create('{0}');", template.Id);
                    sb.AppendLine();
                    sb.AppendLine("\t\t\tthis.root = t.root();");
                    sb.AppendLine("\t\t\tif (parentNode) { parentNode.append(this.root); }");
                    sb.AppendLine();

                    // 여기서 콘트롤 매핑
                    foreach (var control in template.Controls)
                    {
                        sb.AppendFormat("\t\t\tthis.{0} = t.C('{0}');", control.Id);
                        sb.AppendLine();
                    }

                    sb.AppendLine("\t\t}");
                }
                else
                {
                    sb.AppendLine("\t\tconstructor() {");
                    sb.AppendFormat("\t\t\tthis.html = G.templateHolder.create('{0}');", template.Id);
                    sb.AppendLine();

                    // 여기서 콘트롤 매핑
                    foreach (var control in template.Controls)
                    {
                        sb.AppendFormat("\t\t\tthis.{0} = this.html.find('*[data-controlId=\"{0}\"]');", control.Id);
                        sb.AppendLine();
                    }

                    sb.AppendLine("\t\t}");

                    sb.AppendLine("\t\tgetView(): JQuery { return this.html; }");
                    sb.AppendLine("\t\tinitView(): void { }");
                }

                sb.AppendLine("\t}");
                sb.AppendLine("");
            }
            sb.AppendLine("}");

            //Console.WriteLine(sb.ToString());

            File.WriteAllText(args[1], sb.ToString());
        }
    }
}
