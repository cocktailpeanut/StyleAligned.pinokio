module.exports = async (kernel) => {
  let cmd = "uv pip install torch==2.5.0 torchvision==0.20.0 torchaudio==2.5.0 --index-url https://download.pytorch.org/whl/cpu"
  if (kernel.platform === 'darwin') {
    if (kernel.arch === "arm64") {
      cmd = "uv pip install torch torchaudio torchvision"
    } else {
      cmd = "uv pip install torch==2.1.2 torchaudio==2.1.2"
    }
  } else {
    if (kernel.gpu === 'nvidia') {
      if (kernel.gpu_model && / 50.+/.test(kernel.gpu_model)) {
        cmd = "uv pip install --pre torch torchvision torchaudio --index-url https://download.pytorch.org/whl/nightly/cu128"
      } else {
        cmd = "uv pip install torch==2.5.0 torchvision==0.20.0 torchaudio==2.5.0 xformers --index-url https://download.pytorch.org/whl/cu124"
      }
    } else if (kernel.gpu === 'amd') {
      cmd = "uv pip install torch==2.5.0 torchvision==0.20.0 torchaudio==2.5.0 --index-url https://download.pytorch.org/whl/rocm6.2"
    } 
  }
//{
//  "cmds": {
//    "nvidia": "pip install torch torchvision torchaudio xformers --index-url https://download.pytorch.org/whl/cu118",
//    "amd": "pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm5.6",
//    "default": "pip install torch torchvision torchaudio"
//  },
  return {
    "run": [{
      "method": "shell.run",
      "params": {
        "venv": "venv",
        "message": [
          cmd,
//          "{{(gpu === 'nvidia' ? self.cmds.nvidia : ((platform !== 'darwin' && gpu === 'amd') ? self.cmds.amd : self.cmds.default))}}",
          "uv pip install -r requirements.txt"
        ]
      }
    }, {
      "method": "input",
      "params": {
        "title": "Install Success",
        "description": "Go back to the dashboard and launch the app!"
      }
    }, {
      "method": "browser.open",
      "params": {
        "uri": "/?selected=StyleAligned"
      }
    }]
  }
}
