using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace WpfApp1
{
    public class FileItem1 : INotifyPropertyChanged
    {
        private bool _isSelected;

        public string Name { get; set; }
        public string FullPath { get; set; }
        public bool IsDirectory { get; set; }

        //public bool IsSelected
        //{
        //    get => _isSelected;
        //    set
        //    {
        //        if (_isSelected != value)
        //        {
        //            _isSelected = value;
        //            OnPropertyChanged();

        //            // 勾選狀態改變時 → 套用到所有子項目
        //            if (Children != null)
        //            {
        //                foreach (var child in Children)
        //                {
        //                    child.IsSelected = value;
        //                }
        //            }
        //        }
        //    }
        //}

        public ObservableCollection<FileItem> Children { get; set; } = new ObservableCollection<FileItem>();

        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string name = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }
    }
  
}
