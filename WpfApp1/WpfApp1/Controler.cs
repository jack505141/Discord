using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;

namespace WpfApp1
{
    public static class NavigationService
    {
        /// <summary>
        /// 開啟新視窗並關閉當前視窗。
        /// </summary>
        /// <typeparam name="T">目標視窗的類型</typeparam>
        /// <param name="currentWindow">目前的視窗實體 (this)</param>
        public static void NavigateTo<T>(Window currentWindow) where T : Window, new()
        {
            T nextWindow = new T();
            nextWindow.Show();
            currentWindow?.Close(); // 可選擇是否關閉
        }

        /// <summary>
        /// 開啟新視窗但不關閉舊的。
        /// </summary>
        public static void OpenWindow<T>() where T : Window, new()
        {
            T nextWindow = new T();
            nextWindow.Show();
        }
    }
}
