using System;
using System.IO;
using System.Text;

namespace Jul8Compiler
{
    class CodeBuilder
    {
        StringBuilder sb = new StringBuilder();
        int indentLevel = 0;

        public void AppendLine(string s = "")
        {
            sb.AppendLine(Indentation + s);
        }

        public void AppendFormat(string format, params object[] args)
        {
            sb.AppendFormat(Indentation + format, args);
        }

        public void WriteToFile(string path)
        {
            File.WriteAllText(path, sb.ToString());
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
                return new string(' ', 4);
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
