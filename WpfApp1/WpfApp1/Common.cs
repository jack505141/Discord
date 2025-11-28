using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace WpfApp1
{
    public static  class Common
    {
        public static Action<string>? OnLog;
        public static void BackupPathWithStructure(string path)
        {
            if (!File.Exists(path) && !Directory.Exists(path))
            {
               
                return;
            }

            string rootDir = Path.GetPathRoot(path);
            string relativePath = Path.GetRelativePath(rootDir, path); // 計算相對路徑
            string backupRoot = Path.Combine(AppContext.BaseDirectory, "Backup", DateTime.Now.ToString("yyyyMMdd"));
            string backupPath = Path.Combine(backupRoot, relativePath);

            try
            {
                if (File.Exists(path))
                {
                    // 是單一檔案
                    Directory.CreateDirectory(Path.GetDirectoryName(backupPath));
                    File.Copy(path, backupPath, overwrite: true);
                }
                else if (Directory.Exists(path))
                {
                    // 是資料夾
                    foreach (var file in Directory.GetFiles(path, "*", SearchOption.AllDirectories))
                    {
                        string fileRelativePath = Path.GetRelativePath(path, file);
                        string targetBackupPath = Path.Combine(backupPath, fileRelativePath);
                        Directory.CreateDirectory(Path.GetDirectoryName(targetBackupPath));
                        File.Copy(file, targetBackupPath, overwrite: true);
                    }
                }
                OnLog?.Invoke($"已備份 {path} 至 {backupPath}");
              
            }
            catch (Exception ex)
            {
                OnLog?.Invoke($"備份失敗：{ex.Message}");
            }
        }
    }
}
