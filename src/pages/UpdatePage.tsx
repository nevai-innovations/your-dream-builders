import { useEffect, useState, type FormEvent } from "react";
import { logoImage } from "../data/media";

const PASSWORD_KEY = "ydb-update-password";

type Category = "Exterior" | "Interior";

interface Photo {
  id: string;
  title: string;
  category: Category;
  location: string;
  url: string;
  order: number;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string; // "data:<mime>;base64,<data>"
      const [, base64] = result.split(",");
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function callApi(path: string, password: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-update-password": password },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data as { photos: Photo[] };
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ivory-dim">
      <rect x="4" y="11" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PasswordGate({ onUnlock }: { onUnlock: (password: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError("Enter the password");
      return;
    }
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "x-update-password": value.trim() },
      });
      if (!res.ok) throw new Error("Incorrect password");
      sessionStorage.setItem(PASSWORD_KEY, value.trim());
      onUnlock(value.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-charcoal px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 20%, rgba(46,156,245,0.22), transparent 45%), radial-gradient(circle at 85% 80%, rgba(20,101,201,0.2), transparent 50%)",
        }}
      />

      <form onSubmit={submit} className="relative z-10 flex w-full max-w-md flex-col items-center">
        {logoImage && <img src={logoImage} alt="Your Dream Builders" className="mb-6 h-14 w-auto" />}
        <h1 className="text-center font-display text-3xl font-black uppercase tracking-tight text-ivory">
          Update Work Photos
        </h1>
        <p className="mt-2 mb-8 text-center font-sans text-sm text-ivory-dim">
          Enter the password to add, replace, or remove project photos.
        </p>

        <div className="flex w-full items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 backdrop-blur-md">
          <LockIcon />
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Password"
            autoFocus
            className="flex-1 bg-transparent font-sans text-sm text-ivory outline-none placeholder:text-ivory-dim/60"
          />
        </div>
        {error && <p className="mt-3 text-center font-sans text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={checking}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-brand-sky to-brand-blue py-4 font-sans text-sm font-bold text-charcoal transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {checking ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}

function PhotoCard({ photo, password, onChanged }: { photo: Photo; password: string; onChanged: (photos: Photo[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const replace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const imageBase64 = await fileToBase64(file);
      const data = await callApi("/api/upload", password, {
        id: photo.id,
        title: photo.title,
        category: photo.category,
        location: photo.location,
        imageBase64,
        imageType: file.type,
      });
      onChanged(data.photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const remove = async () => {
    if (!confirm(`Remove "${photo.title}"? This can't be undone.`)) return;
    setBusy(true);
    setError("");
    try {
      const data = await callApi("/api/delete", password, { id: photo.id });
      onChanged(data.photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal-2">
      <img src={photo.url} alt={photo.title} className="h-40 w-full object-cover" />
      <div className="p-4">
        <div className="font-sans text-[10px] font-semibold uppercase tracking-widest text-brand-sky/80">
          {photo.category}
        </div>
        <div className="mt-1 mb-3 font-sans text-sm font-bold text-ivory">{photo.title}</div>
        <div className="flex gap-2">
          <label
            className={`flex-1 cursor-pointer rounded-full border border-white/15 py-2 text-center font-sans text-xs font-bold text-ivory transition-colors hover:bg-white/5 ${busy ? "pointer-events-none opacity-50" : ""}`}
          >
            Replace
            <input type="file" accept="image/*" onChange={replace} disabled={busy} className="hidden" />
          </label>
          <button
            onClick={remove}
            disabled={busy}
            className="flex-1 rounded-full border border-white/15 py-2 font-sans text-xs font-bold text-red-400 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
        {error && <p className="mt-2 font-sans text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

function AddPhotoForm({ password, onChanged }: { password: string; onChanged: (photos: Photo[]) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Exterior");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || !title.trim()) {
      setError("Add a title and choose a photo");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const imageBase64 = await fileToBase64(file);
      const data = await callApi("/api/upload", password, {
        title: title.trim(),
        category,
        location: location.trim(),
        imageBase64,
        imageType: file.type,
      });
      onChanged(data.photos);
      setTitle("");
      setLocation("");
      setFile(null);
      e.currentTarget.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-white/12 bg-white/5 px-3.5 py-3 font-sans text-sm text-ivory outline-none placeholder:text-ivory-dim/50 focus:border-brand-blue/50";

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-white/10 bg-charcoal-2 p-7"
    >
      <h2 className="mb-1 font-display text-xl font-bold uppercase tracking-tight text-ivory">Add a New Photo</h2>
      <input
        type="text"
        placeholder="Project title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={inputClass}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className={inputClass}>
        <option>Exterior</option>
        <option>Interior</option>
      </select>
      <input
        type="text"
        placeholder="Location (optional)"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className={inputClass}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:font-sans file:text-xs file:font-semibold file:text-ivory`}
      />
      {error && <p className="font-sans text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-1 rounded-lg bg-gradient-to-r from-brand-sky to-brand-blue py-3 font-sans text-sm font-bold text-charcoal transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {busy ? "Uploading…" : "Add Photo"}
      </button>
    </form>
  );
}

export default function UpdatePage() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASSWORD_KEY) || "");
  const [photos, setPhotos] = useState<Photo[] | null>(null);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data: Photo[]) => setPhotos([...data].sort((a, b) => a.order - b.order)))
      .catch(() => setPhotos([]));
  }, []);

  if (!password) return <PasswordGate onUnlock={setPassword} />;

  const logout = () => {
    sessionStorage.removeItem(PASSWORD_KEY);
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-charcoal">
      <button
        onClick={logout}
        className="fixed top-5 right-6 z-10 rounded-lg border border-white/12 bg-charcoal-2 px-4 py-2.5 font-sans text-xs font-bold text-ivory-dim transition-colors hover:text-ivory"
      >
        Log Out
      </button>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {logoImage && <img src={logoImage} alt="Your Dream Builders" className="mb-4 h-9 w-auto" />}
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ivory">Update Work Photos</h1>
        <p className="mt-1.5 mb-9 font-sans text-sm text-ivory-dim">
          Changes here update the site&rsquo;s work gallery immediately — no waiting.
        </p>

        <AddPhotoForm password={password} onChanged={setPhotos} />

        <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {photos === null && <p className="font-sans text-sm text-ivory-dim">Loading…</p>}
          {photos?.length === 0 && (
            <p className="font-sans text-sm text-ivory-dim">No photos yet — add your first one above.</p>
          )}
          {photos?.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} password={password} onChanged={setPhotos} />
          ))}
        </div>
      </div>
    </div>
  );
}
