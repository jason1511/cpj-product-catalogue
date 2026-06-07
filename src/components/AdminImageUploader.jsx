import { useEffect, useState } from "react";

function AdminImageUploader({
  imageUrl,
  selectedFile,
  title = "Gambar Produk",
  description = "Pilih gambar. Gambar akan diupload saat form produk disimpan.",
  onFileSelected,
}) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    onFileSelected(file);
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
            className="h-64 w-full object-contain p-4"
          />
        ) : (
          <div className="flex h-64 items-center justify-center bg-slate-950 text-center text-sm font-bold text-slate-300">
            Belum ada gambar produk
          </div>
        )}
      </div>

      <div className="mt-5">
        <label className="text-sm font-semibold text-slate-700">
          Pilih Gambar
        </label>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-red-600"
        />

        <p className="mt-2 text-xs text-slate-500">
          Format: JPG, PNG, atau WebP. Maksimal 3MB. File akan diupload saat
          Anda menekan tombol simpan produk.
        </p>
      </div>

      {selectedFile && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-bold text-amber-800">
            Gambar baru sudah dipilih, tetapi belum diupload.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Klik Simpan Perubahan / Tambah Produk untuk mengupload dan
            menerapkan gambar.
          </p>
        </div>
      )}

      {imageUrl && !selectedFile && (
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