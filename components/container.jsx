export default function Container({ children }) {
  return (
    <main className="justify-center mx-auto container max-w-xl mt-16 mb-16">
      <div className="mx-auto">{children}</div>
    </main>
  );
}
