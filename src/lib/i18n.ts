export type Locale = "en" | "id"

type Entry = { en: string; id: string }

const dict: Record<string, Entry> = {
  // nav / shell
  Dashboard: { en: "Dashboard", id: "Dasbor" },
  Gigs: { en: "Gigs", id: "Gig" },
  Masters: { en: "Masters", id: "Master" },
  Settings: { en: "Settings", id: "Pengaturan" },
  "My Payouts": { en: "My Payouts", id: "Pembayaran Saya" },
  "Quick actions…": { en: "Quick actions…", id: "Aksi cepat…" },
  "New Gig": { en: "New Gig", id: "Gig Baru" },
  "Sign out": { en: "Sign out", id: "Keluar" },
  "Toggle theme": { en: "Toggle theme", id: "Ganti tema" },
  "Jump to a page or run a command…": {
    en: "Jump to a page or run a command…",
    id: "Lompat ke halaman atau jalankan perintah…",
  },
  "No results for “{query}”": {
    en: "No results for “{query}”",
    id: "Tidak ada hasil untuk “{query}”",
  },
  "Switch to dark mode": { en: "Switch to dark mode", id: "Beralih ke mode gelap" },
  "Switch to light mode": { en: "Switch to light mode", id: "Beralih ke mode terang" },

  // auth
  "Sign in": { en: "Sign in", id: "Masuk" },
  "Sign in to manage gig settlements": {
    en: "Sign in to manage gig settlements",
    id: "Masuk untuk mengelola pembagian honor gig",
  },
  "Create an account to get started": {
    en: "Create an account to get started",
    id: "Buat akun untuk memulai",
  },
  Name: { en: "Name", id: "Nama" },
  Email: { en: "Email", id: "Email" },
  Password: { en: "Password", id: "Kata sandi" },
  "Your name": { en: "Your name", id: "Nama kamu" },
  "Working…": { en: "Working…", id: "Memproses…" },
  "Create account": { en: "Create account", id: "Buat akun" },
  or: { en: "or", id: "atau" },
  "Redirecting…": { en: "Redirecting…", id: "Mengalihkan…" },
  "Don't have an account?": { en: "Don't have an account?", id: "Belum punya akun?" },
  "Sign up": { en: "Sign up", id: "Daftar" },
  "Already have an account?": { en: "Already have an account?", id: "Sudah punya akun?" },
  "Authentication failed": { en: "Authentication failed", id: "Autentikasi gagal" },
  "Something went wrong. Please try again.": {
    en: "Something went wrong. Please try again.",
    id: "Terjadi kesalahan. Coba lagi.",
  },

  // admin setup
  "Admin setup": { en: "Admin setup", id: "Pengaturan admin" },
  "Create the master admin account.": {
    en: "Create the master admin account.",
    id: "Buat akun admin utama.",
  },
  "Setup code": { en: "Setup code", id: "Kode pengaturan" },
  "Already set up.": { en: "Already set up.", id: "Sudah diatur." },
  "The app is already configured. Sign in to continue.": {
    en: "The app is already configured. Sign in to continue.",
    id: "Aplikasi sudah dikonfigurasi. Masuk untuk melanjutkan.",
  },
  "Invalid setup code": { en: "Invalid setup code", id: "Kode pengaturan tidak valid" },
  "An admin account already exists.": {
    en: "An admin account already exists.",
    id: "Akun admin sudah ada.",
  },
  "This email already has an account.": {
    en: "This email already has an account.",
    id: "Email ini sudah punya akun.",
  },

  // statuses
  Draft: { en: "Draft", id: "Draf" },
  Confirmed: { en: "Confirmed", id: "Terkonfirmasi" },
  Paid: { en: "Paid", id: "Lunas" },
  Cancelled: { en: "Cancelled", id: "Dibatalkan" },
  Pending: { en: "Pending", id: "Menunggu" },
  Transfer: { en: "Transfer", id: "Transfer" },
  Cash: { en: "Cash", id: "Tunai" },
  QRIS: { en: "QRIS", id: "QRIS" },

  // dashboard
  Overview: { en: "Overview", id: "Ringkasan" },
  "Revenue this month": { en: "Revenue this month", id: "Pendapatan bulan ini" },
  "vs last month": { en: "vs last month", id: "vs bulan lalu" },
  Net: { en: "Net", id: "Bersih" },
  "Band share": { en: "Band share", id: "Bagian band" },
  Crew: { en: "Crew", id: "Kru" },
  Meals: { en: "Meals", id: "Uang makan" },
  "Production & other": { en: "Production & other", id: "Produksi & lainnya" },
  "Net band (all time)": { en: "Net band (all time)", id: "Band bersih (semua waktu)" },
  "Across {n} gigs": { en: "Across {n} gigs", id: "Dari {n} gig" },
  "Members paid": { en: "Members paid", id: "Anggota dibayar" },
  "Marked paid in settlements": {
    en: "Marked paid in settlements",
    id: "Ditandai lunas pada pembagian",
  },
  "Awaiting settlement": { en: "Awaiting settlement", id: "Menunggu pembagian" },
  "Confirmed, not yet paid": {
    en: "Confirmed, not yet paid",
    id: "Dikonfirmasi, belum dibayar",
  },
  "Upcoming gigs": { en: "Upcoming gigs", id: "Gig mendatang" },
  "Next: {name}": { en: "Next: {name}", id: "Berikutnya: {name}" },
  "Nothing scheduled": { en: "Nothing scheduled", id: "Tidak ada jadwal" },
  "Revenue by month": { en: "Revenue by month", id: "Pendapatan per bulan" },
  "Recent gigs": { en: "Recent gigs", id: "Gig terbaru" },
  "View all": { en: "View all", id: "Lihat semua" },
  "No gigs yet": { en: "No gigs yet", id: "Belum ada gig" },
  "Add a gig first to build its itinerary.": {
    en: "Add a gig first to build its itinerary.",
    id: "Tambahkan gig dulu untuk menyusun rundownnya.",
  },
  "This itinerary template will be removed.": {
    en: "This itinerary template will be removed.",
    id: "Template rundown ini akan dihapus.",
  },
  "Create your first gig to start tracking settlements.": {
    en: "Create your first gig to start tracking settlements.",
    id: "Buat gig pertama untuk mulai melacak pembagian.",
  },
  "Create your first gig to start settling fees.": {
    en: "Create your first gig to start settling fees.",
    id: "Buat gig pertama untuk mulai membagi honor.",
  },

  // gig list
  Import: { en: "Import", id: "Impor" },
  "Search gigs…": { en: "Search gigs…", id: "Cari gig…" },
  "Search by event, client, or city…": {
    en: "Search by event, client, or city…",
    id: "Cari berdasarkan event, klien, atau kota…",
  },
  "All statuses": { en: "All statuses", id: "Semua status" },
  "{n} gigs · {total} total": { en: "{n} gigs · {total} total", id: "{n} gig · {total} total" },
  "No matching gigs": { en: "No matching gigs", id: "Gig tidak cocok" },
  "Try a different search or status filter.": {
    en: "Try a different search or status filter.",
    id: "Coba pencarian atau filter status lain.",
  },
  Event: { en: "Event", id: "Acara" },
  Date: { en: "Date", id: "Tanggal" },
  Client: { en: "Client", id: "Klien" },
  Fee: { en: "Fee", id: "Honor" },
  Status: { en: "Status", id: "Status" },

  // gig detail
  "Back to gigs": { en: "Back to gigs", id: "Kembali ke gig" },
  Export: { en: "Export", id: "Ekspor" },
  Edit: { en: "Edit", id: "Ubah" },
  "Gig not found.": { en: "Gig not found.", id: "Gig tidak ditemukan." },
  Info: { en: "Info", id: "Info" },
  Venue: { en: "Venue", id: "Lokasi" },
  City: { en: "City", id: "Kota" },
  "e.g. JIExpo Kemayoran": { en: "e.g. JIExpo Kemayoran", id: "cth. JIExpo Kemayoran" },
  "e.g. Bandung": { en: "e.g. Bandung", id: "cth. Bandung" },
  Soundcheck: { en: "Soundcheck", id: "Soundcheck" },
  "Show time": { en: "Show time", id: "Waktu show" },
  Type: { en: "Type", id: "Tipe" },
  Members: { en: "Members", id: "Anggota" },
  Member: { en: "Member", id: "Anggota" },
  Split: { en: "Split", id: "Bagian" },
  Payout: { en: "Payout", id: "Pembayaran" },
  "Production team": { en: "Production team", id: "Tim produksi" },
  Role: { en: "Role", id: "Peran" },
  Expenses: { en: "Expenses", id: "Biaya" },
  Category: { en: "Category", id: "Kategori" },
  Amount: { en: "Amount", id: "Jumlah" },
  Settlement: { en: "Settlement", id: "Pembagian" },
  "Gig fee": { en: "Gig fee", id: "Honor gig" },
  Production: { en: "Production", id: "Produksi" },
  Other: { en: "Other", id: "Lainnya" },
  "÷ {n} members": { en: "÷ {n} members", id: "÷ {n} anggota" },
  "Delete gig?": { en: "Delete gig?", id: "Hapus gig?" },
  "This permanently removes the gig and its settlement lines.": {
    en: "This permanently removes the gig and its settlement lines.",
    id: "Ini menghapus permanen gig beserta seluruh baris pembagiannya.",
  },
  "Delete gig": { en: "Delete gig", id: "Hapus gig" },
  "Mark as paid": { en: "Mark as paid", id: "Tandai lunas" },
  "Mark as pending": { en: "Mark as pending", id: "Tandai menunggu" },
  Unknown: { en: "Unknown", id: "Tidak dikenal" },
  Equal: { en: "Equal", id: "Sama rata" },

  // editor
  "Loading…": { en: "Loading…", id: "Memuat…" },
  "Untitled gig": { en: "Untitled gig", id: "Gig tanpa judul" },
  "New gig": { en: "New gig", id: "Gig baru" },
  Cancel: { en: "Cancel", id: "Batal" },
  "Save gig": { en: "Save gig", id: "Simpan gig" },
  "Saving…": { en: "Saving…", id: "Menyimpan…" },
  Details: { en: "Details", id: "Detail" },
  "Event name": { en: "Event name", id: "Nama acara" },
  "e.g. Rooftop birthday party": {
    en: "e.g. Rooftop birthday party",
    id: "cth. Pesta ulang tahun di rooftop",
  },
  "e.g. Djakarta Warehouse Project": {
    en: "e.g. Djakarta Warehouse Project",
    id: "cth. Djakarta Warehouse Project",
  },
  "e.g. Annual company dinner": {
    en: "e.g. Annual company dinner",
    id: "cth. Makan malam tahunan perusahaan",
  },
  "e.g. Birthday at the garden": { en: "e.g. Birthday at the garden", id: "cth. Ulang tahun di taman" },
  "e.g. Product launch night": { en: "e.g. Product launch night", id: "cth. Malam peluncuran produk" },
  "Give this gig a name": { en: "Give this gig a name", id: "Beri nama gig ini" },
  "e.g. Rizky's family": { en: "e.g. Rizky's family", id: "cth. Keluarga Rizky" },
  "e.g. Ismaya Live": { en: "e.g. Ismaya Live", id: "cth. Ismaya Live" },
  "e.g. PT Maju Jaya": { en: "e.g. PT Maju Jaya", id: "cth. PT Maju Jaya" },
  "e.g. Marketing team": { en: "e.g. Marketing team", id: "cth. Tim marketing" },
  "Who's paying for the show?": {
    en: "Who's paying for the show?",
    id: "Siapa yang bayar show-nya?",
  },
  "Gig type": { en: "Gig type", id: "Tipe gig" },
  "Total fee": { en: "Total fee", id: "Total honor" },
  "Total payout": { en: "Total payout", id: "Total pembayaran" },
  "Soundcheck time": { en: "Soundcheck time", id: "Waktu soundcheck" },
  "Before the cutoff time, eligible crew get a meal allowance.": {
    en: "Before the cutoff time, eligible crew get a meal allowance.",
    id: "Sebelum batas waktu, kru yang memenuhi syarat mendapat uang makan.",
  },
  "Override the automatic meal allowance for this gig.": {
    en: "Override the automatic meal allowance for this gig.",
    id: "Ganti perhitungan otomatis uang makan untuk gig ini.",
  },
  Override: { en: "Override", id: "Ganti" },
  "Auto ({fee} per eligible crew)": {
    en: "Auto ({fee} per eligible crew)",
    id: "Otomatis ({fee} per kru yang memenuhi syarat)",
  },
  "Band split": { en: "Band split", id: "Pembagian band" },
  "How the net band share is divided among members.": {
    en: "How the net band share is divided among members.",
    id: "Cara pembagian band bersih kepada anggota.",
  },
  "% Split": { en: "% Split", id: "Bagian %" },
  "Add member…": { en: "Add member…", id: "Tambah anggota…" },
  "No more members available.": {
    en: "No more members available.",
    id: "Tidak ada anggota lagi.",
  },
  "Manage members": { en: "Manage members", id: "Kelola anggota" },
  "Add at least one member to split the settlement.": {
    en: "Add at least one member to split the settlement.",
    id: "Tambahkan minimal satu anggota untuk membagi pembagian.",
  },
  payout: { en: "payout", id: "dibayar" },
  "Splits total {total}% — they must equal 100%.": {
    en: "Splits total {total}% — they must equal 100%.",
    id: "Total bagian {total}% — harus sama dengan 100%.",
  },
  "Crew and specialists paid from the gig fee.": {
    en: "Crew and specialists paid from the gig fee.",
    id: "Kru dan spesialis yang dibayar dari honor gig.",
  },
  "Add crew…": { en: "Add crew…", id: "Tambah kru…" },
  "No more crew available.": { en: "No more crew available.", id: "Tidak ada kru lagi." },
  "No matches": { en: "No matches", id: "Tidak ada kecocokan" },
  "Manage crew": { en: "Manage crew", id: "Kelola kru" },
  "No crew added. Gig fee goes fully to the band.": {
    en: "No crew added. Gig fee goes fully to the band.",
    id: "Belum ada kru. Honor gig sepenuhnya untuk band.",
  },
  "+ meal {amount}": { en: "+ meal {amount}", id: "+ makan {amount}" },
  "Production and other costs. Production categories sit between crew and meals in the ledger.": {
    en: "Production and other costs. Production categories sit between crew and meals in the ledger.",
    id: "Biaya produksi dan lainnya. Kategori produksi berada antara kru dan makan di pembukuan.",
  },
  "e.g. Photographer": { en: "e.g. Photographer", id: "cth. Fotografer" },
  "e.g. Transport": { en: "e.g. Transport", id: "cth. Transport" },
  "Add expense": { en: "Add expense", id: "Tambah biaya" },
  "Add production role…": { en: "Add production role…", id: "Tambah peran produksi…" },
  Notes: { en: "Notes", id: "Catatan" },
"e.g. Backline provided by the venue…": {
    en: "e.g. Backline provided by the venue…",
    id: "cth. Backline disediakan venue…",
  },
  Balanced: { en: "Balanced", id: "Seimbang" },
  "Over budget": { en: "Over budget", id: "Melebihi budget" },
  "Split invalid": { en: "Split invalid", id: "Pembagian tidak valid" },
  "Member payouts": { en: "Member payouts", id: "Pembayaran anggota" },
  "Total expenses exceed the gig fee.": {
    en: "Total expenses exceed the gig fee.",
    id: "Total biaya melebihi honor gig.",
  },
  "Percentage splits must total 100%.": {
    en: "Percentage splits must total 100%.",
    id: "Bagian persen harus total 100%.",
  },
  "Add a fee and at least one member to balance.": {
    en: "Add a fee and at least one member to balance.",
    id: "Tambahkan honor dan minimal satu anggota agar seimbang.",
  },
  "Waiting for input": { en: "Waiting for input", id: "Menunggu input" },
  "Balanced — ready to finalize": {
    en: "Balanced — ready to finalize",
    id: "Seimbang — siap difinalisasi",
  },
  "Not balanced — cannot finalize": {
    en: "Not balanced — cannot finalize",
    id: "Belum seimbang — belum bisa difinalisasi",
  },
  "Remove member": { en: "Remove member", id: "Hapus anggota" },
  "Remove crew": { en: "Remove crew", id: "Hapus kru" },
  "Remove expense": { en: "Remove expense", id: "Hapus biaya" },
  Morning: { en: "Morning", id: "Pagi" },
  Midday: { en: "Midday", id: "Siang" },
  Evening: { en: "Evening", id: "Sore" },
  Night: { en: "Night", id: "Malam" },
  Afternoon: { en: "Afternoon", id: "Siang" },
  "Early evening": { en: "Early evening", id: "Sore" },
  "Night show": { en: "Night show", id: "Tampil malam" },
  "Late night": { en: "Late night", id: "Larut malam" },

  // itinerary & report
  Itinerary: { en: "Itinerary", id: "Rundown" },
  "Rundown from soundcheck to show.": {
    en: "Rundown from soundcheck to show.",
    id: "Rundown dari soundcheck sampai show.",
  },
  "Itinerary template": { en: "Itinerary template", id: "Template rundown" },
  "Edit itinerary template": { en: "Edit itinerary template", id: "Edit template rundown" },
  "Itinerary templates": { en: "Itinerary templates", id: "Template rundown" },
  "New itinerary template": { en: "New itinerary template", id: "Buat template rundown" },
  "Template name": { en: "Template name", id: "Nama template" },
  "No itineraries yet": {
    en: "No itineraries yet",
    id: "Belum ada template rundown",
  },
  "Pick a template to build the day rundown.": {
    en: "Pick a template to build the day rundown.",
    id: "Pilih template untuk menyusun rundown hari itu.",
  },
  "Save template": { en: "Save template", id: "Simpan template" },
  "Delete template": { en: "Delete template", id: "Hapus template" },
  "Delete template?": { en: "Delete template?", id: "Hapus template?" },
  "Download PDF": { en: "Download PDF", id: "Unduh PDF" },
  Maps: { en: "Maps", id: "Peta" },
  "Open in Google Maps": { en: "Open in Google Maps", id: "Buka di Google Maps" },
  "Day rundown": { en: "Day rundown", id: "Rundown harian" },
  "Venue location": { en: "Venue location", id: "Lokasi venue" },
  "Page {n} of {total}": { en: "Page {n} of {total}", id: "Halaman {n} dari {total}" },
  "No items": { en: "No items", id: "Belum ada item" },
  Time: { en: "Time", id: "Waktu" },
  Activity: { en: "Activity", id: "Kegiatan" },
  "e.g. Load in & setup": { en: "e.g. Load in & setup", id: "cth. Load in & set up" },
  "e.g. Doors open": { en: "e.g. Doors open", id: "cth. Buka pintu" },
  "e.g. Showtime": { en: "e.g. Showtime", id: "cth. Waktu show" },
  "Remove item": { en: "Remove item", id: "Hapus item" },
  "Add item": { en: "Add item", id: "Tambah item" },
  "{n} items": { en: "{n} items", id: "{n} item" },
  Local: { en: "Local", id: "Dalam kota" },
  "Out of town": { en: "Out of town", id: "Luar kota" },
  Showtime: { en: "Showtime", id: "Waktu show" },
  "Line check": { en: "Line check", id: "Cek line" },
  "Doors open": { en: "Doors open", id: "Buka pintu" },
  Depart: { en: "Depart", id: "Berangkat" },
  "Arrive venue": { en: "Arrive venue", id: "Tiba di venue" },
  "Load in & setup": { en: "Load in & setup", id: "Load in & set up" },
  "Export PDF": { en: "Export PDF", id: "Ekspor PDF" },
  "Settlement report": { en: "Settlement report", id: "Laporan pembagian" },
  "Generated with": { en: "Generated with", id: "Dibuat dengan" },
  Summary: { en: "Summary", id: "Ringkasan" },
  Band: { en: "Band", id: "Band" },

  // masters
  "Members and crew reused across gigs.": {
    en: "Members and crew reused across gigs.",
    id: "Anggota dan kru dipakai ulang di setiap gig.",
  },
  "The band — their splits roll into new gigs.": {
    en: "The band — their splits roll into new gigs.",
    id: "Band — pembagian mereka mengalir ke gig baru.",
  },
  "Add member": { en: "Add member", id: "Tambah anggota" },
  "No members": { en: "No members", id: "Belum ada anggota" },
  "Add your band members to split settlements.": {
    en: "Add your band members to split settlements.",
    id: "Tambahkan anggota band untuk membagi pembagian.",
  },
  "Default split": { en: "Default split", id: "Bagian default" },
  Account: { en: "Account", id: "Akun" },
  Active: { en: "Active", id: "Aktif" },
  Inactive: { en: "Inactive", id: "Nonaktif" },
  "Edit member": { en: "Edit member", id: "Ubah anggota" },
  "Delete member": { en: "Delete member", id: "Hapus anggota" },
  "Standard rates and meal eligibility. Specialists are exempt from meal allowance.": {
    en: "Standard rates and meal eligibility. Specialists are exempt from meal allowance.",
    id: "Tarif standar dan kelayakan makan. Spesialis dikecualikan dari uang makan.",
  },
  "Add crew": { en: "Add crew", id: "Tambah kru" },
  "No crew": { en: "No crew", id: "Belum ada kru" },
  "Add road crew and specialists.": {
    en: "Add road crew and specialists.",
    id: "Tambahkan kru lapangan dan spesialis.",
  },
  "Default fee": { en: "Default fee", id: "Honor default" },
  Yes: { en: "Yes", id: "Ya" },
  Exempt: { en: "Exempt", id: "Dikecualikan" },
  "Edit crew": { en: "Edit crew", id: "Ubah kru" },
  "Delete crew": { en: "Delete crew", id: "Hapus kru" },
  Defaults: { en: "Defaults", id: "Default" },
  "Applied when new gigs reference crew rates and meal allowances.": {
    en: "Applied when new gigs reference crew rates and meal allowances.",
    id: "Diterapkan saat gig baru memakai tarif kru dan uang makan.",
  },
  "Crew min fee": { en: "Crew min fee", id: "Honor min kru" },
  "Crew max fee": { en: "Crew max fee", id: "Honor maks kru" },
  "Meal allowance": { en: "Meal allowance", id: "Uang makan" },
  "Default split (%)": { en: "Default split (%)", id: "Bagian default (%)" },
  "Account (optional)": { en: "Account (optional)", id: "Akun (opsional)" },
  "e.g. BCA — 1234567890": { en: "e.g. BCA — 1234567890", id: "cth. BCA — 1234567890" },
  Standard: { en: "Standard", id: "Standar" },
  Specialist: { en: "Specialist", id: "Spesialis" },
  "Min fee": { en: "Min fee", id: "Honor min" },
  "Max fee": { en: "Max fee", id: "Honor maks" },
  "Eligible for meal allowance": {
    en: "Eligible for meal allowance",
    id: "Memenuhi syarat uang makan",
  },
  "Remove {name}?": { en: "Remove {name}?", id: "Hapus {name}?" },
  "Past gig payouts are kept. The member will no longer be selectable.": {
    en: "Past gig payouts are kept. The member will no longer be selectable.",
    id: "Pembayaran gig lama tetap tersimpan. Anggota tidak akan bisa dipilih lagi.",
  },
  "Past gig lines are kept. The crew will no longer be selectable.": {
    en: "Past gig lines are kept. The crew will no longer be selectable.",
    id: "Baris gig lama tetap tersimpan. Kru tidak akan bisa dipilih lagi.",
  },

  // settings
  "Crew settings": { en: "Crew settings", id: "Pengaturan kru" },
  "Defaults applied to new gigs and crew.": {
    en: "Defaults applied to new gigs and crew.",
    id: "Default yang diterapkan ke gig baru dan kru.",
  },
  "Production crew": { en: "Production crew", id: "Kru produksi" },
  "Default fee per production role, used when adding expenses to a gig.": {
    en: "Default fee per production role, used when adding expenses to a gig.",
    id: "Honor default per peran produksi, dipakai saat menambah biaya ke gig.",
  },
  "Save": { en: "Save", id: "Simpan" },
  "Add role": { en: "Add role", id: "Tambah peran" },
  "Role name": { en: "Role name", id: "Nama peran" },
  "Default pay": { en: "Default pay", id: "Honor default" },
  "Production roles": { en: "Production roles", id: "Peran produksi" },
  "No production roles yet.": {
    en: "No production roles yet.",
    id: "Belum ada peran produksi.",
  },
  "Activity log": { en: "Activity log", id: "Log aktivitas" },
  "Who changed or exported what, and when.": {
    en: "Who changed or exported what, and when.",
    id: "Siapa mengubah atau mengekspor apa, dan kapan.",
  },
  "No activity yet.": { en: "No activity yet.", id: "Belum ada aktivitas." },
  "Changes and exports will be recorded here.": {
    en: "Changes and exports will be recorded here.",
    id: "Perubahan dan ekspor akan dicatat di sini.",
  },
  Who: { en: "Who", id: "Siapa" },
  Action: { en: "Action", id: "Aksi" },
  Item: { en: "Item", id: "Item" },
  When: { en: "When", id: "Kapan" },
  "Created gig": { en: "Created gig", id: "Membuat gig" },
  "Updated gig": { en: "Updated gig", id: "Memperbarui gig" },
  "Imported gig": { en: "Imported gig", id: "Mengimpor gig" },
  "Deleted gig": { en: "Deleted gig", id: "Menghapus gig" },
  "Changed status": { en: "Changed status", id: "Mengubah status" },
  "Updated member payment": { en: "Updated member payment", id: "Memperbarui pembayaran anggota" },
  "Updated crew payment": { en: "Updated crew payment", id: "Memperbarui pembayaran kru" },
  "Added member": { en: "Added member", id: "Menambahkan anggota" },
  "Updated member": { en: "Updated member", id: "Memperbarui anggota" },
  "Deleted member": { en: "Deleted member", id: "Menghapus anggota" },
  "Added crew": { en: "Added crew", id: "Menambahkan kru" },
  "Updated crew": { en: "Updated crew", id: "Memperbarui kru" },
  "Deleted crew": { en: "Deleted crew", id: "Menghapus kru" },
  "Updated settings": { en: "Updated settings", id: "Memperbarui pengaturan" },
  "Added production role": { en: "Added production role", id: "Menambahkan peran produksi" },
  "Updated production role": { en: "Updated production role", id: "Memperbarui peran produksi" },
  "Deleted production role": { en: "Deleted production role", id: "Menghapus peran produksi" },
  "Created itinerary": { en: "Created itinerary", id: "Membuat itinerary" },
  "Updated itinerary": { en: "Updated itinerary", id: "Memperbarui itinerary" },
  "Deleted itinerary": { en: "Deleted itinerary", id: "Menghapus itinerary" },
  "Exported PDF": { en: "Exported PDF", id: "Mengekspor PDF" },
  "Exported Excel": { en: "Exported Excel", id: "Mengekspor Excel" },
  "Exported itinerary PDF": { en: "Exported itinerary PDF", id: "Mengekspor PDF itinerary" },
  "Crew defaults": { en: "Crew defaults", id: "Default kru" },
  "Production roles feed the expense picker in the gig editor.": {
    en: "Production roles feed the expense picker in the gig editor.",
    id: "Peran produksi menjadi pilihan biaya di editor gig.",
  },

  // member dashboard
  "Your payouts across all gigs.": {
    en: "Your payouts across all gigs.",
    id: "Pembayaranmu di semua gig.",
  },
  "Total paid": { en: "Total paid", id: "Total dibayar" },
  "Awaiting payment": { en: "Awaiting payment", id: "Menunggu pembayaran" },
  Upcoming: { en: "Upcoming", id: "Mendatang" },
  "No payouts yet.": { en: "No payouts yet.", id: "Belum ada pembayaran." },
  "Your account is not linked to a member record yet.": {
    en: "Your account is not linked to a member record yet.",
    id: "Akunmu belum terhubung ke anggota.",
  },
  "Payout history": { en: "Payout history", id: "Riwayat pembayaran" },
  "Next gig": { en: "Next gig", id: "Gig berikutnya" },
}

export function getActiveLocale(): Locale {
  if (typeof window === "undefined") return "en"
  const stored = localStorage.getItem("mp-locale")
  return stored === "id" || stored === "en" ? stored : "en"
}

let activeLocale: Locale = "en"
export function setActiveLocale(l: Locale) {
  activeLocale = l
}
export function currentLocale(): Locale {
  return activeLocale
}

export function translate(key: string, locale: Locale, params?: Record<string, string | number>): string {
  let out = dict[key]?.[locale] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      out = out.replaceAll(`{${k}}`, String(v))
    }
  }
  return out
}

export function formatDateLocal(iso: string, locale: Locale): string {
  if (!iso) return ""
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}