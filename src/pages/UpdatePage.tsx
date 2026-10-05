import { useEffect, useState, type FormEvent } from "react";
import { logoImage } from "../data/media";

const PASSWORD_KEY = "ydb-update-password";

type Category = "Exterior" | "Interior";

interface Client {
  id: string;
  name: string;
  location: string;
  quote: string;
  url: string;
  order: number;
}

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

// Vercel rejects request bodies over ~4.5 MB, and base64 adds a third on top,
// so full-size phone photos would fail. Shrink to a sensible web size first.
const MAX_IMAGE_EDGE = 2000;

async function prepareImage(file: File): Promise<{ base64: string; type: string }> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (blob) {
      const base64 = await fileToBase64(new File([blob], "photo.jpg", { type: "image/jpeg" }));
      return { base64, type: "image/jpeg" };
    }
  } catch {
    // Browser couldn't decode it (e.g. some HEIC files) -- fall back to the original.
  }
  return { base64: await fileToBase64(file), type: file.type };
}

/**
 * In-page "are you sure?" for deletes. Replaces the browser's confirm() popup,
 * which many browsers title "JavaScript" -- QA read that as an error (Bug 1).
 */
function DeleteConfirm({
  label,
  busy,
  onConfirm,
  onCancel,
}: {
  label: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div role="alertdialog" aria-label={`Delete ${label}?`} className="rounded-xl border border-red-400/30 bg-red-400/[0.06] p-3">
      <p className="font-sans text-xs text-ivory">
        Delete <span className="font-bold">{label}</span>? This can&rsquo;t be undone.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={onConfirm}
          disabled={busy}
          className="flex-1 rounded-full bg-red-500 py-2 font-sans text-xs font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-50"
        >
          {busy ? "Deleting…" : "Delete"}
        </button>
        <button
          onClick={onCancel}
          disabled={busy}
          className="flex-1 rounded-full border border-white/15 py-2 font-sans text-xs font-bold text-ivory transition-colors hover:bg-white/5 disabled:opacity-50"
        >
          Keep
        </button>
      </div>
    </div>
  );
}

// Text fields must contain real words, not just symbols like "@#$%" (Bug 2).
// \p{L} accepts letters in any script, including Malayalam.
const hasLetters = (value: string) => /\p{L}/u.test(value);
const hasLettersOrNumbers = (value: string) => /[\p{L}\p{N}]/u.test(value);

function validateClient(fields: { name: string; location: string; quote: string }) {
  if (!fields.name.trim()) return "Add the client's name";
  if (!hasLetters(fields.name)) return "Client name must include letters, not just symbols";
  if (fields.location.trim() && !hasLettersOrNumbers(fields.location))
    return "Location must include letters or numbers, not just symbols";
  if (fields.quote.trim() && !hasLetters(fields.quote)) return "Testimonial must include words, not just symbols";
  return "";
}

async function callApi(path: string, password: string, body: Record<string, unknown>) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-update-password": password },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
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
          Update Website Photos
        </h1>
        <p className="mt-2 mb-8 text-center font-sans text-sm text-ivory-dim">
          Enter the password to manage project photos and happy-client handovers.
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
      const image = await prepareImage(file);
      const data = await callApi("/api/upload", password, {
        id: photo.id,
        title: photo.title,
        category: photo.category,
        location: photo.location,
        imageBase64: image.base64,
        imageType: image.type,
      });
      onChanged(data.photos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const [confirming, setConfirming] = useState(false);

  const remove = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await callApi("/api/delete", password, { id: photo.id });
      onChanged(data.photos);
    } catch (err) {
      setConfirming(false);
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
        {confirming ? (
          <DeleteConfirm label={`"${photo.title}"`} busy={busy} onConfirm={remove} onCancel={() => setConfirming(false)} />
        ) : (
        <div className="flex gap-2">
          <label
            className={`flex-1 cursor-pointer rounded-full border border-white/15 py-2 text-center font-sans text-xs font-bold text-ivory transition-colors hover:bg-white/5 ${busy ? "pointer-events-none opacity-50" : ""}`}
          >
            Replace
            <input type="file" accept="image/*" onChange={replace} disabled={busy} className="hidden" />
          </label>
          <button
            onClick={() => setConfirming(true)}
            disabled={busy}
            className="flex-1 rounded-full border border-white/15 py-2 font-sans text-xs font-bold text-red-400 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
        )}
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
    // React clears e.currentTarget once the handler yields, so keep the form
    // now -- calling e.currentTarget.reset() after the upload threw (Bug 3).
    const form = e.currentTarget;
    if (!file || !title.trim()) {
      setError("Add a title and choose a photo");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const image = await prepareImage(file);
      const data = await callApi("/api/upload", password, {
        title: title.trim(),
        category,
        location: location.trim(),
        imageBase64: image.base64,
        imageType: image.type,
      });
      onChanged(data.photos);
      setTitle("");
      setLocation("");
      setFile(null);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

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
      {/* color-scheme: dark makes the browser draw the open list dark too, and
          explicit option colours keep both choices readable (Bug 4). */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as Category)}
        className={`${inputClass} [color-scheme:dark]`}
      >
        <option value="Exterior" className="bg-charcoal-2 text-ivory">
          Exterior
        </option>
        <option value="Interior" className="bg-charcoal-2 text-ivory">
          Interior
        </option>
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
        className={fileInputClass}
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

const inputClass =
  "w-full rounded-lg border border-white/12 bg-white/5 px-3.5 py-3 font-sans text-sm text-ivory outline-none placeholder:text-ivory-dim/50 focus:border-brand-blue/50";
const fileInputClass = `${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:font-sans file:text-xs file:font-semibold file:text-ivory`;

const sortByOrder = <T extends { order: number }>(items: T[]) => [...items].sort((a, b) => a.order - b.order);

/** Name / location / testimonial inputs, shared by the add form and the edit card. */
function ClientFields({
  name,
  location,
  quote,
  onChange,
}: {
  name: string;
  location: string;
  quote: string;
  onChange: (field: "name" | "location" | "quote", value: string) => void;
}) {
  return (
    <>
      <input
        type="text"
        placeholder="Client name (e.g. Rajesh & Family)"
        value={name}
        maxLength={80}
        onChange={(e) => onChange("name", e.target.value)}
        className={inputClass}
      />
      <input
        type="text"
        placeholder="Location / project (optional)"
        value={location}
        maxLength={80}
        onChange={(e) => onChange("location", e.target.value)}
        className={inputClass}
      />
      <textarea
        placeholder="Testimonial in the client's words (optional)"
        value={quote}
        maxLength={600}
        rows={4}
        onChange={(e) => onChange("quote", e.target.value)}
        className={`${inputClass} resize-y`}
      />
    </>
  );
}

function AddClientForm({ password, onChanged }: { password: string; onChanged: (clients: Client[]) => void }) {
  const [fields, setFields] = useState({ name: "", location: "", quote: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const invalid = validateClient(fields);
    if (invalid || !file) {
      setError(invalid || "Choose a handover photo");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const image = await prepareImage(file);
      const data = await callApi("/api/clients", password, {
        ...fields,
        imageBase64: image.base64,
        imageType: image.type,
      });
      onChanged(sortByOrder(data.clients));
      setFields({ name: "", location: "", quote: "" });
      setFile(null);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mx-auto flex max-w-lg flex-col gap-3 rounded-2xl border border-white/10 bg-charcoal-2 p-7"
    >
      <h2 className="mb-1 font-display text-xl font-bold uppercase tracking-tight text-ivory">Add a Key Handover</h2>
      <ClientFields {...fields} onChange={(field, value) => setFields((f) => ({ ...f, [field]: value }))} />
      <label className="font-sans text-xs text-ivory-dim">
        Handover photo
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className={`${fileInputClass} mt-1.5`}
        />
      </label>
      {error && <p className="font-sans text-xs text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="mt-1 rounded-lg bg-gradient-to-r from-brand-sky to-brand-blue py-3 font-sans text-sm font-bold text-charcoal transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {busy ? "Uploading…" : "Add Handover"}
      </button>
    </form>
  );
}

function ClientCard({
  client,
  password,
  onChanged,
}: {
  client: Client;
  password: string;
  onChanged: (clients: Client[]) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [fields, setFields] = useState({ name: client.name, location: client.location, quote: client.quote });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    try {
      const data = await callApi("/api/clients", password, { id: client.id, ...body });
      onChanged(sortByOrder(data.clients));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const replacePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;
    const image = await prepareImage(file);
    await run({ ...fields, imageBase64: image.base64, imageType: image.type });
    input.value = "";
  };

  const save = async () => {
    const invalid = validateClient(fields);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (await run(fields)) setEditing(false);
  };

  const [confirming, setConfirming] = useState(false);
  const remove = async () => {
    if (!(await run({ action: "delete" }))) setConfirming(false);
  };

  const buttonClass =
    "flex-1 rounded-full border border-white/15 py-2 text-center font-sans text-xs font-bold transition-colors hover:bg-white/5 disabled:opacity-50";

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-charcoal-2">
      <img src={client.url} alt={client.name} className="h-48 w-full object-cover" />
      <div className="flex flex-col gap-3 p-4">
        {editing ? (
          <ClientFields {...fields} onChange={(field, value) => setFields((f) => ({ ...f, [field]: value }))} />
        ) : (
          <div>
            <div className="font-sans text-sm font-bold text-ivory">{client.name}</div>
            {client.location && <div className="font-sans text-xs text-ivory-dim">{client.location}</div>}
            <p className="mt-2 line-clamp-4 font-sans text-xs italic leading-relaxed text-ivory-dim">
              {client.quote ? `“${client.quote}”` : "No testimonial yet"}
            </p>
          </div>
        )}
        {confirming ? (
          <DeleteConfirm label={client.name} busy={busy} onConfirm={remove} onCancel={() => setConfirming(false)} />
        ) : (
        <div className="flex gap-2">
          {editing ? (
            <>
              <button onClick={save} disabled={busy} className={`${buttonClass} text-brand-sky`}>
                {busy ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => {
                  setFields({ name: client.name, location: client.location, quote: client.quote });
                  setEditing(false);
                }}
                disabled={busy}
                className={`${buttonClass} text-ivory`}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} disabled={busy} className={`${buttonClass} text-ivory`}>
                Edit
              </button>
              <label className={`${buttonClass} cursor-pointer text-ivory ${busy ? "pointer-events-none opacity-50" : ""}`}>
                Photo
                <input type="file" accept="image/*" onChange={replacePhoto} disabled={busy} className="hidden" />
              </label>
              <button onClick={() => setConfirming(true)} disabled={busy} className={`${buttonClass} text-red-400`}>
                Delete
              </button>
            </>
          )}
        </div>
        )}
        {error && <p className="font-sans text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}

/** On/off switch for showing the whole Happy Clients section on the live site. */
function SectionToggle({
  enabled,
  hasEntries,
  password,
  onChanged,
}: {
  enabled: boolean;
  hasEntries: boolean;
  password: string;
  onChanged: (enabled: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const toggle = async () => {
    setBusy(true);
    setError("");
    try {
      const data = await callApi("/api/clients", password, { action: "setEnabled", enabled: !enabled });
      onChanged(data.enabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const status = !enabled
    ? "Hidden — the Happy Clients section is not shown on the website."
    : hasEntries
      ? "Live — the Happy Clients section is shown on the website."
      : "Switched on, but it will only appear once you add a handover below.";

  return (
    <div className="mx-auto mb-8 flex max-w-lg items-center justify-between gap-5 rounded-2xl border border-white/10 bg-charcoal-2 p-5">
      <div>
        <p className="font-display text-lg font-bold uppercase tracking-tight text-ivory">Show on website</p>
        <p className={`mt-0.5 font-sans text-xs ${enabled && hasEntries ? "text-emerald-400" : "text-ivory-dim"}`}>
          {status}
        </p>
        {error && <p className="mt-1 font-sans text-xs text-red-400">{error}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label="Show the Happy Clients section on the website"
        onClick={toggle}
        disabled={busy}
        className={`relative h-8 w-14 shrink-0 rounded-full transition-colors disabled:opacity-60 ${
          enabled ? "bg-emerald-500" : "bg-white/15"
        }`}
      >
        <span
          className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}

export default function UpdatePage() {
  const [password, setPassword] = useState(() => sessionStorage.getItem(PASSWORD_KEY) || "");
  const [tab, setTab] = useState<"work" | "clients">("work");
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [clients, setClients] = useState<Client[] | null>(null);
  const [clientsEnabled, setClientsEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data: Photo[]) => setPhotos(sortByOrder(data)))
      .catch(() => setPhotos([]));
  }, []);

  // With the password, the API returns every entry even while the section is
  // switched off, so they can be prepared before going public.
  useEffect(() => {
    if (!password) return;
    fetch("/api/clients", { headers: { "x-update-password": password } })
      .then((r) => r.json())
      .then((data: { enabled: boolean; clients: Client[] }) => {
        setClients(sortByOrder(data.clients));
        setClientsEnabled(data.enabled);
      })
      .catch(() => setClients([]));
  }, [password]);

  if (!password) return <PasswordGate onUnlock={setPassword} />;

  const logout = () => {
    sessionStorage.removeItem(PASSWORD_KEY);
    setPassword("");
  };

  const tabClass = (active: boolean) =>
    `rounded-full px-5 py-2.5 font-sans text-xs font-bold uppercase tracking-wide transition-colors ${
      active ? "bg-gradient-to-r from-brand-sky to-brand-blue text-charcoal" : "text-ivory-dim hover:text-ivory"
    }`;

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
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-ivory">Update Website Photos</h1>
        <p className="mt-1.5 font-sans text-sm text-ivory-dim">
          Changes here go live on the site immediately — no waiting.
        </p>

        <div className="mt-7 mb-9 inline-flex gap-1 rounded-full border border-white/10 bg-charcoal-2 p-1">
          <button onClick={() => setTab("work")} className={tabClass(tab === "work")}>
            Work Photos
          </button>
          <button onClick={() => setTab("clients")} className={tabClass(tab === "clients")}>
            Happy Clients
          </button>
        </div>

        {tab === "work" ? (
          <>
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
          </>
        ) : (
          <>
            <SectionToggle
              enabled={clientsEnabled}
              hasEntries={(clients?.length ?? 0) > 0}
              password={password}
              onChanged={setClientsEnabled}
            />
            <p className="mx-auto mb-6 max-w-lg font-sans text-sm text-ivory-dim">
              Add a photo from each key handover, with the client&rsquo;s name and, if they&rsquo;re happy to share
              it, a few words about working with you.
            </p>
            <AddClientForm password={password} onChanged={setClients} />
            <div className="mt-10 grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
              {clients === null && <p className="font-sans text-sm text-ivory-dim">Loading…</p>}
              {clients?.length === 0 && (
                <p className="font-sans text-sm text-ivory-dim">No handovers yet — add your first one above.</p>
              )}
              {clients?.map((client) => (
                <ClientCard key={client.id} client={client} password={password} onChanged={setClients} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
