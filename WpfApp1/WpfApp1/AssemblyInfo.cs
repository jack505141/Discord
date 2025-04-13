using System;
using System.Threading;
using System.Windows;

namespace WpfApp1
{
    public partial class App : Application
    {
        private static Mutex mutex;

        //protected override void OnStartup(StartupEventArgs e)
        //{
        //    // 確保應用程式名稱唯一
        //    bool isNewInstance;
        //    mutex = new Mutex(true, "WpfApp1_Unique_Instance", out isNewInstance);

        //    if (!isNewInstance)
        //    {
        //        MessageBox.Show("應用程式已經在運行！", "提示", MessageBoxButton.OK, MessageBoxImage.Information);
        //        Application.Current.Shutdown(); // **關閉新實例**
        //        return;
        //    }

        //    base.OnStartup(e);
        //}
    }
}

