export const buildScoreImage = async ({
  appName,
  fullName,
  score,
  total,
  duration,
}: {
  appName: string;
  fullName: string;
  score: number;
  total: number;
  duration?: string;
}) => {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, "#a9cfee");
  gradient.addColorStop(0.5, "#f7cfc9");
  gradient.addColorStop(1, "#cfe76a");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.beginPath();
  ctx.arc(180, 200, 160, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(880, 320, 200, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(760, 1500, 240, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#1d1d1d";
  ctx.lineWidth = 6;
  ctx.strokeRect(60, 120, 960, 1680);

  ctx.fillStyle = "#1d1d1d";
  ctx.textAlign = "center";
  ctx.font = "bold 72px Fredoka, sans-serif";
  ctx.fillText(appName, 540, 320);

  ctx.font = "52px Nunito, sans-serif";
  ctx.fillText("Ton score final", 540, 520);

  ctx.font = "bold 140px Fredoka, sans-serif";
  ctx.fillText(`${score} / ${total}`, 540, 700);

  ctx.font = "48px Nunito, sans-serif";
  ctx.fillText(fullName, 540, 840);

  if (duration) {
    ctx.font = "44px Nunito, sans-serif";
    ctx.fillText(`Temps : ${duration}`, 540, 920);
  }

  ctx.font = "40px Nunito, sans-serif";
  ctx.fillText("Merci d'avoir participé !", 540, 1040);

  return canvas;
};

export const shareScoreImage = async (canvas: HTMLCanvasElement) => {
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((out) => resolve(out), "image/png")
  );
  if (!blob) return false;
  const file = new File([blob], "score.png", { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Mon score",
      text: "Regarde mon score au quiz !",
    });
    return true;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "score.png";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
};
