using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WpfApp1
{
    internal interface IGit
    {
        void Init();
        Task CloneAsync(string repositoryUrl, string destinationPath);
        Task<bool> PullAsync(string repositoryPath);
        void Push(string repositoryPath);
        void Commit(string repositoryPath, string message);
        Task<string> Checkout(string repositoryPath, string branchName);
        Task<bool> Fetch(string repositoryPath);
        void Merge(string repositoryPath, string branchName);
        void Status(string repositoryPath);
        void Log(string repositoryPath);
        void Reset(string repositoryPath, string commitHash);
        Task<List<string>> GetBranchesAsync(string repositoryPath);
        Task<bool> BranchExists(string repoPath, string branchName);
        Task CheckoutNewBranch(string repoPath, string branchName);
    }
    public class gitlibrary : IGit
    {
        public async Task<string> Checkout(string repositoryPath, string branchName)
        {
            var error = "";
            string result = "";
            await Task.Run(() =>
            {
                using (var process = new System.Diagnostics.Process())
                {
                    branchName = branchName.Trim(); // 去掉多餘的空格
                    if (branchName.StartsWith("*"))
                    {
                        branchName = branchName.Substring(1).Trim(); 
                    }
                    process.StartInfo.FileName = "git";
                    process.StartInfo.Arguments = $"checkout {branchName}";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;
                    process.StartInfo.WorkingDirectory = repositoryPath;

                    process.Start();
                    string result = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();
                    process.WaitForExit();
                   
                    
                }
            });
            if (!string.IsNullOrEmpty(error))
            {
                result = error;
                return result;
                    }
            return result;
        }

        public async Task CloneAsync(string repositoryUrl, string destinationPath)
        {
            if (string.IsNullOrWhiteSpace(repositoryUrl))
            {
                return;
            }
            await Task.Run(() =>
            {
                using (var process = new System.Diagnostics.Process())
                {
                    process.StartInfo.FileName = "git";
                    process.StartInfo.Arguments = $"clone {repositoryUrl} \"{destinationPath}\"";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;

                    process.Start();
                    string result = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();
                    process.WaitForExit();

                   
                }
            });
        }

        public  void Commit(string repositoryPath, string message)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> Fetch(string repositoryPath)
        {
            return await Task.Run(() =>
            {
                using (var process = new System.Diagnostics.Process())
                {
                    process.StartInfo.FileName = "git";
                    process.StartInfo.Arguments = "fetch";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;
                    process.StartInfo.WorkingDirectory = repositoryPath;

                    process.Start();
                    string result = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();
                    process.WaitForExit();
                    if (!string.IsNullOrEmpty(error))
                    {
                        return false;
                    }
                    return true;

                }
            });
        }

        public void Init()
        {
            throw new NotImplementedException();
        }

        public void Log(string repositoryPath)
        {
            throw new NotImplementedException();
        }

        public void Merge(string repositoryPath, string branchName)
        {
            throw new NotImplementedException();
        }

        public async Task<bool> PullAsync(string repositoryPath)
        {
           return await Task.Run(() =>
            {
                using (var process = new System.Diagnostics.Process())
                {
                    process.StartInfo.FileName = "git";
                    process.StartInfo.Arguments = "pull";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;
                    process.StartInfo.WorkingDirectory = repositoryPath;

                    process.Start();
                    string result = process.StandardOutput.ReadToEnd();
                    string error = process.StandardError.ReadToEnd();
                    process.WaitForExit();
                     if (!string.IsNullOrEmpty(error))
                {
                    return false;
                }
                return true;

                }
            });
           
        }

        public void Push(string repositoryPath)
        {
            throw new NotImplementedException();
        }

        public void Reset(string repositoryPath, string commitHash)
        {
            throw new NotImplementedException();
        }

        public void Status(string repositoryPath)
        {
            throw new NotImplementedException();
        }
        public async Task<List<string>> GetBranchesAsync(string repositoryPath)
        {
            return await Task.Run(() =>
            {
                var branches = new List<string>();
                using (var process = new System.Diagnostics.Process())
                {
                    process.StartInfo.FileName = "git";
                    process.StartInfo.Arguments = "branch -a";
                    process.StartInfo.RedirectStandardOutput = true;
                    process.StartInfo.RedirectStandardError = true;
                    process.StartInfo.UseShellExecute = false;
                    process.StartInfo.CreateNoWindow = true;
                    process.StartInfo.WorkingDirectory = repositoryPath;
                    process.Start();

                    while (!process.StandardOutput.EndOfStream)
                    {
                        branches.Add(process.StandardOutput.ReadLine().Trim());
                    }
                    process.WaitForExit();
                    string error = process.StandardError.ReadToEnd();
                    if (!string.IsNullOrEmpty(error))
                    {
                        throw new Exception($"Git Branch Error: {error}");
                    }
                }

                return branches;
            });
        }


        public async Task<bool> BranchExists(string repoPath, string branchName)
        {
            return await Task.Run(() =>
            {
                ProcessStartInfo psi = new ProcessStartInfo
                {
                    FileName = "git",
                    Arguments = $"branch --list {branchName}",
                    WorkingDirectory = repoPath,
                    RedirectStandardOutput = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (Process process = Process.Start(psi))
                {
                    string output = process.StandardOutput.ReadToEnd().Trim();
                    process.WaitForExit();

                    return !string.IsNullOrEmpty(output);
                }
            });
        }


        public async Task CheckoutNewBranch(string repoPath, string branchName)
        {
            await Task.Run(() =>
            {
                branchName = branchName.TrimStart('*', ' ');

                // **執行 `git fetch` 確保最新遠端分支列表**
                RunGitCommand(repoPath, $"fetch origin");

                // **檢查本地分支是否存在**
                bool branchExists = BranchExists(repoPath, branchName).Result;

                if (branchExists)
                {
                    // ✅ 分支已存在，直接切換
                    RunGitCommand(repoPath, $"checkout {branchName}");
                }
                else
                {
                    // 🚀 分支不存在，創建並追蹤遠端分支
                    RunGitCommand(repoPath, $"checkout -b {branchName} origin/{branchName}");
                }
            });
        }


        private void RunGitCommand(string repoPath, string arguments)
        {
            ProcessStartInfo psi = new ProcessStartInfo
            {
                FileName = "git",
                Arguments = arguments,
                WorkingDirectory = repoPath,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using (Process process = Process.Start(psi))
            {
                string output = process.StandardOutput.ReadToEnd().Trim();
                string error = process.StandardError.ReadToEnd().Trim();
                process.WaitForExit();

                // ✅ 如果錯誤訊息是「Switched to a new branch」，就視為正常
                if (!string.IsNullOrWhiteSpace(error) && !error.Contains("Switched to a new branch"))
                {
                    throw new Exception($"Git 錯誤: {error}");
                }
            }
        }



    }
}
