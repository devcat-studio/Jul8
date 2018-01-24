#pragma warning disable 649 // 'blahblah' 필드에는 할당되지 않으므로 항상 null 기본값을 사용합니다.

using System.Collections.Generic;

namespace Jul8Compiler
{
    class ConfigRoot
    {
        public List<string> header;
        public List<string> footer;
        public List<BuildItem> build;
    }

    class BuildItem
    {
        public string source;
        public string target;
    }
}
