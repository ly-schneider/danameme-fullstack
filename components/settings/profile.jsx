export default function ProfileSettings({ profile }) {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between">
          <p>E-Mail</p>
          <div className="flex flex-row w-full space-x-4">
            <input className="input" />
            <button className="text btn-secondary text-muted">
              Aktualisieren
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
