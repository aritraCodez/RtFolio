import { Shield, Database, Cpu, WifiOff } from "lucide-react";



export function PrivacyPolicy() {
  return (
    <div className="flex-1 bg-linear-to-br from-[#faf7f2] to-[#f5f0e6] overflow-y-auto flex justify-center items-center font-body">
      <div className="w-full max-w-2xl bg-white border border-border-warm rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-8 md:p-12 relative animate-fade-in">


        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-sienna/5 flex items-center justify-center text-sienna shrink-0">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground m-0">
              Privacy & Data Policy
            </h2>
            <p className="text-xs text-muted-foreground m-0 uppercase tracking-[0.5px] mt-0.5">
              Secure & Local-First Portfolio Creator
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground/80 leading-relaxed mb-10">
          RtFolio is built around a local-first architecture. This means your creative work, captions, settings, and personal data remain under your absolute control and never leave your device.
        </p>

        {/* Policy Grid */}
        <div className="flex flex-col gap-8">
          {/* Card 1: Local Processing */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-parchment border border-border-warm flex items-center justify-center text-sienna shrink-0 mt-1">
              <Cpu size={16} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground m-0 mb-1">
                Client-Side Processing Only
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed m-0">
                All uploaded images are handled via client-side Blob URLs. No files are transferred to external databases, APIs, or storage buckets. Your browser is the sole processor.
              </p>
            </div>
          </div>

          {/* Card 2: Local Session Persistence */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-parchment border border-border-warm flex items-center justify-center text-sienna shrink-0 mt-1">
              <Database size={16} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground m-0 mb-1">
                Zero External Databases & Session Persistence
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed m-0">
                We do not maintain cloud databases, require accounts, or collect your data. For your convenience, your active portfolio layout, captions, and images are temporarily persisted in your browser's secure local sandbox (using IndexedDB) so they survive page reloads. This data is automatically wiped clean from your device as soon as you close the browser tab.
              </p>
            </div>
          </div>

          {/* Card 3: Secure PDF Export */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-parchment border border-border-warm flex items-center justify-center text-sienna shrink-0 mt-1">
              <Shield size={16} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground m-0 mb-1">
                Secure Offline Generation
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed m-0">
                When you export your artwork pages, the PDF document is rendered directly on your system using open-source sandboxed libraries (<code className="bg-stone-100 text-stone-700 px-1 rounded text-[11px] font-mono">jsPDF</code> and <code className="bg-stone-100 text-stone-700 px-1 rounded text-[11px] font-mono">html2canvas</code>).
              </p>
            </div>
          </div>

          {/* Card 4: Offline Capability */}
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-lg bg-parchment border border-border-warm flex items-center justify-center text-sienna shrink-0 mt-1">
              <WifiOff size={16} />
            </div>
            <div>
              <h3 className="font-display text-base font-semibold text-foreground m-0 mb-1">
                Works Fully Offline
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed m-0">
                Because RtFolio does not rely on any cloud backend APIs, once the page loads, you can safely turn off your network connection and perform all portfolio actions entirely offline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
