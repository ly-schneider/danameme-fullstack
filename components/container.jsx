export default function Container({ children }) {
  return (
    <main className="justify-center mx-auto container max-w-xl mb-16">
      <div className="mx-auto mt-8">{children}</div>
    </main>
  );
}
