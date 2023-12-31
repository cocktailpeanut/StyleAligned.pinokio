from diffusers import StableDiffusionXLPipeline, DDIMScheduler
import torch
import mediapy
import sa_handler
import math
import gradio as gr
import inversion
import numpy as np
from PIL import Image


if torch.cuda.is_available():
  device = "cuda"
elif torch.backends.mps.is_available():
  device = "mps"
else:
  device = "cpu"
scheduler = DDIMScheduler(beta_start=0.00085, beta_end=0.012, beta_schedule="scaled_linear", clip_sample=False, set_alpha_to_one=False)
pipeline = StableDiffusionXLPipeline.from_pretrained( "stabilityai/stable-diffusion-xl-base-1.0", torch_dtype=torch.float16, variant="fp16", use_safetensors=True, scheduler=scheduler).to(device)
print(f"device = {device}")
def run(image, src_style, src_prompt, prompts, shared_score_shift, shared_score_scale, guidance_scale, num_inference_steps, large, seed):
  print(f"run {image}")
  prompts = prompts.splitlines()
  if large:
    dim = 1024
    d = 128
  else:
    dim = 512
    d = 64
  image = image.resize((dim, dim))
  x0 = np.array(image)
  zts = inversion.ddim_inversion(pipeline, x0, src_prompt, num_inference_steps, 2)
  prompts.insert(0, src_prompt)

  # some parameters you can adjust to control fidelity to reference
  shared_score_shift = np.log(shared_score_shift)  # higher value induces higher fidelity, set 0 for no shift
  handler = sa_handler.Handler(pipeline)
  sa_args = sa_handler.StyleAlignedArgs(
    share_group_norm=True, share_layer_norm=True, share_attention=True,
    adain_queries=True, adain_keys=True, adain_values=False,
    shared_score_shift=shared_score_shift, shared_score_scale=shared_score_scale,)
  handler.register(sa_args)

  # for very famouse images consider supressing attention to refference, here is a configuration example:
  # shared_score_shift = np.log(1)
  # shared_score_scale = 0.5

  for i in range(1, len(prompts)):
    prompts[i] = f'{prompts[i]}, {src_style}.'

  zT, inversion_callback = inversion.make_inversion_callback(zts, offset=5)
  g_cpu = torch.Generator(device='cpu')
  if seed > 0:
    g_cpu.manual_seed(seed)
    latents = torch.randn(len(prompts), 4, d, d, device='cpu', generator=g_cpu, dtype=pipeline.unet.dtype,).to(device)
  else:
    latents = torch.randn(len(prompts), 4, d, d, device='cpu', dtype=pipeline.unet.dtype,).to(device)

  latents[0] = zT
  images_a = pipeline(prompts, latents=latents, callback_on_step_end=inversion_callback, num_inference_steps=num_inference_steps, guidance_scale=guidance_scale).images
  handler.remove()
  return images_a

demo = gr.Interface(
  run,
  inputs=[
    gr.Image(label="Reference image", type="pil"),
    gr.Textbox(label="Describe the reference style"),
    gr.Textbox(label="Describe the reference image"),
    gr.Textbox(label="Prompts to generate images (separate with new lines)", lines=10),
    gr.Number(1.1, label="shared_score_shift"),
    gr.Number(1.0, label="shared_score_scale"),
    gr.Number(10.0, label="guidance_scale"),
    gr.Number(50, label="num_inference_steps", precision=0),
    gr.Checkbox(False, label="Large (1024x1024)"),
    gr.Number(0, label="seed (0 for random)", precision=0)
  ],
  outputs=gr.Gallery()
)
#demo.dependencies[0]["show_progress"] = "minimal"
demo.launch()
