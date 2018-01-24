using System;
using System.Collections.Generic;
using System.IO;
using System.Text;

namespace Jul8Compiler
{
    class CodeBuilder
    {
        List<string> code = new List<string>();
        int indentLevel = 0;

        public void AppendLine(string s = "")
        {
            code.Add(Indentation + s);
        }

        public void AppendFormat(string format, params object[] args)
        {
            AppendLine(string.Format(format, args));
        }

        public void WriteToFile(string path)
        {
            string content = String.Join("\r\n", code);

            if (File.Exists(path) && File.ReadAllText(path) == content)
            {
                Console.WriteLine("Skipping " + path + "...");
            }
            else
            {
                Console.WriteLine("Writing " + path + "...");
                File.WriteAllText(path, content, new UTF8Encoding(true));
            }
        }

        public Indented Indent(string open, string close)
        {
            AppendLine(open);
            ++indentLevel;
            return new Indented(this, close);
        }

        public void Unindent()
        {
            --indentLevel;
        }

        string Indentation
        {
            get
            {
                return new string(' ', 4 * indentLevel);
            }
        }

        public class Indented : IDisposable
        {
            CodeBuilder parent;
            string close;

            public Indented(CodeBuilder parent, string close)
            {
                this.parent = parent;
                this.close = close;
            }

            public void Dispose()
            {
                parent.Unindent();
                parent.AppendLine(close);
            }
        }
    }
}
