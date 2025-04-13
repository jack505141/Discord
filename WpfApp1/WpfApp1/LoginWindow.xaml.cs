using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Shapes;

namespace WpfApp1
{
    /// <summary>
    /// LoginWindow.xaml 的互動邏輯
    /// </summary>
    public partial class LoginWindow : Window
    {
        
        public static bool IsAuthenticated { get; private set; } = false; 
        public LoginWindow()
        {
            InitializeComponent();
        }
        private void Confirm_Click(object sender, RoutedEventArgs e)
        {
            string correctPassword = DateTime.Now.ToString("yyyyMMdd") + "/52653760";
            if (PasswordInput.Password == correctPassword)
            {

                IsAuthenticated = true;
                NavigationService.NavigateTo<MainWindow>(this);
            }
            else
            {
                MessageBox.Show("密碼錯誤，請重試！", "錯誤", MessageBoxButton.OK, MessageBoxImage.Error);
                PasswordInput.Clear();
            }
        }
    }
}
