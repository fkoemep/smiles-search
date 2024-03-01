import { Switch } from "@headlessui/react";

export default function Footer() {
  return (
    <>
      <footer class="px-4 py-2 gap-4 w-full text-xs italic flex justify-between items-end">
        <Switch.Group as="div" class="flex items-center gap-2">
        <a
            href="https://github.com/fkoemep/smiles-search"
            target="_blank"
            className="flex-shrink-0"
        >
          <img width={36} src="/github-mark.svg"  alt="Github"/>
        </a>
        </Switch.Group>
      </footer>
    </>
  );
}
