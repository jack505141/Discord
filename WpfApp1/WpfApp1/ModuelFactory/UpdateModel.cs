using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using static System.Net.Mime.MediaTypeNames;
using Application = System.Windows.Application;

namespace WpfApp1.ModuelFactory
{
    public class UpdateModel : ICommandModule
    {
        private readonly Dictionary<string, Action<string[]>> _commands;
        private Rigister rigister = new Rigister();
        public UpdateModel()
        {
           
            _commands = new Dictionary<string, Action<string[]>>
        {
            { "d", Change },
            { "check", CheckUpdate },
            { "apply", ApplyUpdate },
            { "config", ListUpdate },
             { "delete", DeleteConfig },
               { "VS", updateVerion },
                  { "web", Web },
                { "connect", Connect } 

        };
        }
        public void Execute(string command, string[] args)
        {
            if (_commands.TryGetValue(command.ToLower(), out var action))
            {
                action.Invoke(args);
            }
            else
            {
                CommandManager.OnLog?.Invoke($"[update] ❓ 未知指令：{command}");
            }
        }
        private void Change(string[] args)
        {

            NavigationService.NavigateTo<Assemble>(Application.Current.Windows
       .OfType<Window>()
       .FirstOrDefault(w => w.IsActive));

        }
        private void Connect(string[] args)
        {

            NavigationService.NavigateTo<MultiConect>(Application.Current.Windows
       .OfType<MultiConect>()
       .FirstOrDefault(w => w.IsActive));

        }
        
        private void Web(string[] args)
        {
           
            NavigationService.NavigateTo<WebView>(Application.Current.Windows
       .OfType<Window>()
       .FirstOrDefault(w => w.IsActive));

        }
      
        private void DeleteConfig(string[] args)
        {
            string[] targetFolders = {
        Path.Combine(AppContext.BaseDirectory, "Storage"),
        Path.Combine(AppContext.BaseDirectory, "Config")
    };
           
            var deletedFiles = new List<string>();
            foreach (var folder in targetFolders)
            {
                if (!Directory.Exists(folder))
                {
                    CommandManager.OnLog?.Invoke($"❗ 資料夾不存在：{folder}");
                    continue;
                }
                foreach (var file in Directory.GetFiles(folder))
                {
                    try
                    {
                        deletedFiles.Add(Path.GetFileName(file));
                        File.Delete(file);
                        CommandManager.OnLog?.Invoke($"{file} 已被刪除！");
                    }
                    catch (Exception ex)
                    {
                        deletedFiles.Add($"[刪除失敗] {Path.GetFileName(file)}：{ex.Message}");
                    }
                }

              
            }


        }

        private void CheckUpdate(string[] args)
        {
            CommandManager.OnLog?.Invoke("[update] 檢查是否有可用更新...");
            // 加入更新檢查邏輯
        }
        private void updateVerion(string[] args)
        {
            var Kioskid = rigister.GetKiosk();
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

            NavigationService.NavigateTo<FoldConfig>(Application.Current.Windows
       .OfType<Window>()
       .FirstOrDefault(w => w.IsActive));

        }
    }
}
