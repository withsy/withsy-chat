function Page() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start px-6 py-12 text-start">
      <h2 className="mb-4 text-3xl font-bold">License</h2>
      <p className="mb-6 text-base leading-relaxed">
        Some avatar images in this service are generated using the Thumbs style
        from DiceBear Avatars. This style is licensed under the CC0 1.0 license,
        allowing free use for both personal and commercial projects with no
        attribution required. We thank DiceBear for providing beautiful, open
        avatars.
      </p>
    </div>
  );
}

(Page as any).layoutType = "home";
export default Page;
