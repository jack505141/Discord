using Microsoft.Win32;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WpfApp1
{
    public class Rigister
    {
        public bool Amend(string kioskID)
        {
            string registryPath = @"SOFTWARE\KioskPlatfotm";
            string valueName1 = "kioskid"; // 要修改的字段名
            string newValue = kioskID;

            try
            {

                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(registryPath, writable: true))
                {
                    if (key != null)
                    {
                        key.SetValue(valueName1, newValue, RegistryValueKind.String);
                        return true;
                    }
                    else
                    {
                        System.Console.WriteLine("指定的注册表路径不存在！");
                        return false;
                    }
                }
            }
            catch (System.Exception ex)
            {
                return false;
            }
        }


        public string GetKiosk()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "cmd.exe",
                    Arguments = "/c reg query \"HKEY_CURRENT_USER\\SOFTWARE\\KioskPlafotm\" /v kioskId",
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                Process process = new Process { StartInfo = psi };
                process.Start();
                string output = process.StandardOutput.ReadToEnd();
                process.WaitForExit();

                // 解析輸出取得 KioskId
                string[] lines = output.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (string line in lines)
                {
                    if (line.Contains("kioskId"))
                    {
                        string[] parts = line.Split(new[] { " " }, StringSplitOptions.RemoveEmptyEntries);
                        return parts[parts.Length - 1]; // 取得最後一個值（就是 kioskId）
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("取得 KioskId 發生錯誤: " + ex.Message);
            }

            return "未找到 KioskId";
        }
    }
}
