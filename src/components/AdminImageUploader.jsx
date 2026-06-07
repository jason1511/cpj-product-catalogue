import { useState } from "react";

function AdminImageUploader({
  productId,
  colorName = "",
  imageUrl,
  title = "Gambar Produk",
  description = "Upload gambar terlebih dahulu, lalu klik tombol simpan pada form produk untuk menerapkan gambar ke katalog publik.",
  onImageUploaded,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    setSelectedFile(file || null);
    setUploadMessage("");

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl("");
    }
  }

  async function handleUpload() {
     if (!productId) {
  setUploadMessage("Isi ID produk terlebih dahulu sebelum upload gambar.");
  return;
}
    if (!selectedFile) {
      setUploadMessage("Pilih gambar terlebih dahulu.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadMessage("");

      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("productId", productId);
     if (colorName) {
  formData.append("colorName", colorName);
}
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
  throw new Error(
    data.error
      ? `${data.message || "Gagal mengunggah gambar."} Detail: ${data.error}`
      : data.message || "Gagal mengunggah gambar.",
  );
}

      onImageUploaded(data.imageUrl);
      setUploadMessage("Gambar berhasil diunggah.");
    } catch (error) {
      console.error(error);
      setUploadMessage(error.message);
    } finally {
      setIsUploading(false);
    }
  }

  const displayImage = previewUrl || imageUrl;

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">{title}</h2>

<p className="mt-2 text-sm leading-6 text-slate-600">
  {description}
</p>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        {displayImage ? (
          <img
            src={displayImage}
            alt="Preview produk"
            className="h-64 w-full object-cover"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-slate-950 text-center text-sm font-bold text-slate-300">
            Belum ada gambar produk
          </div>
        )}
      </div>

      <div className="mt-5">
        <label className="text-sm font-semibold text-slate-700">
          Upload Gambar
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-red-600"
        />

        <p className="mt-2 text-xs text-slate-500">
          Format: JPG, PNG, atau WebP. Maksimal 3MB.
        </p>
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={isUploading || !selectedFile}
        className="mt-5 w-full rounded-xl bg-red-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/25 transition hover:-translate-y-0.5 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUploading ? "Mengunggah..." : "Upload Gambar"}
      </button>

      {uploadMessage && (
        <p className="mt-3 text-sm font-semibold text-slate-600">
          {uploadMessage}
        </p>
      )}

      {imageUrl && (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            URL gambar tersimpan
          </p>
          <p className="mt-2 break-all text-xs text-slate-700">{imageUrl}</p>
        </div>
      )}
    </div>
  );
}

export default AdminImageUploader;