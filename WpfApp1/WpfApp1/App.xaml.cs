using System.Configuration;
using System.Data;
using System.Windows;
using Microsoft.Win32;
namespace WpfApp1
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        protected override void OnStartup(StartupEventArgs e)
        {
            base.OnStartup(e);
            //Utils.CopyDocument();
            // ✅ 加這段來設定 IE11 模
            SetBrowserFeatureControl();
        }

        private void SetBrowserFeatureControl()
        {
            string appName = System.IO.Path.GetFileName(System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName);
            Registry.SetValue(
                @"HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION",
                appName, 11001, RegistryValueKind.DWord);
        }
    }

}
