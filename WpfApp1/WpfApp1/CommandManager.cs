using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WpfApp1
{
    public static class CommandManager
    {
        private static readonly Dictionary<string, ICommandModule> _modules = new();
        public static Action<string>? OnLog;

        public static void RegisterModule(string name, ICommandModule module)
        {
            _modules[name.ToLower()] = module;

        }

        public static void Execute(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return;

            var parts = input.Trim().Split(' ', 3, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length < 2)
            {
                OnLog?.Invoke($"指令格式錯誤，需為：module Error {parts[0]}");
                return;
            }

            var moduleName = parts[0].ToLower();
            var commandName = parts[1].ToLower();
            var args = parts.Length == 3 ? parts[2].Split(' ') : Array.Empty<string>();

            if (_modules.TryGetValue(moduleName, out var module))
            {
                module.Execute(commandName, args);
            }
            else
            {
                OnLog?.Invoke($"找不到模組：{moduleName}");
            }
        }
    }
    public interface ICommandModule
    {
        void Execute(string command, string[] args);
    }

}
