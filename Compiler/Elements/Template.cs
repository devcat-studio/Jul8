using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Jul8Compiler.Elements
{
    class Template
    {
        public string Id { get; set; }
        public List<Control> Controls { get; set; }
        public List<Container> Containers { get; set; }

        public Template()
        {
            Controls = new List<Control>();
            Containers = new List<Container>();
        }
    }
}
