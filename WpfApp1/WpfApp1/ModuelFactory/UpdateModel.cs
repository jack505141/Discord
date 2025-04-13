using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace WpfApp1.ModuelFactory
{
    public class UpdateModel : ICommandModule
    {
        private readonly Dictionary<string, Action<string[]>> _commands;
        public UpdateModel()
        {
            _commands = new Dictionary<string, Action<string[]>>
        {
            { "Change", Change },
            { "check", CheckUpdate },
            { "apply", ApplyUpdate },
            { "list", ListUpdate }
          
        };
        }
        public void Execute(string command, string[] args)
        {
            if (command == "test")
            {
                
            }
            else
            {
                CommandManager.OnLog?.Invoke($"[example] 未知指令：{command}");
            }
        }
        private void Change(string[] args)
        {
            CommandManager.OnLog?.Invoke("[update] 執行測試更新！");
            // 加入你自己的邏輯
        }

        private void CheckUpdate(string[] args)
        {
            CommandManager.OnLog?.Invoke("[update] 檢查是否有可用更新...");
            // 加入更新檢查邏輯
        }

        private void ApplyUpdate(string[] args)
        {
            CommandManager.OnLog?.Invoke("[update] 套用更新中...");
            // 加入套用邏輯
        }

        private void ListUpdate(string[] args)
        {
          
        }
    }
}
