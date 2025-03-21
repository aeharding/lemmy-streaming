import { useState } from "react";
import Instance from "./Instance";

export default function CustomInstance() {
  const [instance, setInstance] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) return <Instance instance={instance} />;

  return (
    <tr>
      <td colSpan={2}>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="mylemmyinstance.com"
            value={instance}
            onChange={(e) => setInstance(e.target.value)}
          />
          <button type="submit">Submit</button>
        </form>
      </td>
    </tr>
  );
}
