import { useState } from "react";
import { useEffect } from "react";
import "./App.css";
import CustomInstance from "./CustomInstance";
import Instance from "./Instance";

function App() {
  const [instances, setInstances] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(
        "https://data.lemmyverse.net/data/instance.min.json",
      );

      const data = await res.json();

      const instances = data
        .sort((a, b) => b.score - a.score)
        .map(({ base }) => base)
        .slice(0, 50);

      setInstances(instances);
    })();
  }, []);

  return (
    <>
      <h1>🤔 Does my Lemmy instance support video streaming?</h1>
      <p>
        Many Lemmy instances are misconfigured, which can break progressive
        video streaming and even basic image loading in strange ways. The latest
        default lemmy-ansible config handles this correctly, but many instances
        use custom proxy setups that cause issues. This tool will check that:
      </p>
      <ul>
        <li>
          ✅ The instance supports{" "}
          <a
            href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests"
            target="_blank"
            rel="noopener noreferrer"
          >
            HTTP range requests
          </a>{" "}
          for proper video streaming
        </li>
        <li>✅ CORS headers are properly set for API and pictrs media</li>
      </ul>
      <h2>I'm a user, my instance is on this list!</h2>
      <p>
        This may be why you sometimes see broken videos. If your instance is
        shown as broken on this list, please inform the admins!
      </p>
      <p>
        Also, lemmy often hotlinks to media on other instances. So, even if you
        have an account on a properly configured instance, other instances may
        still cause problems for you!
      </p>
      <h2>I'm an admin, how do I fix this?</h2>
      <p>
        <strong>The simplest fix:</strong> Use the latest{" "}
        <a
          href="https://github.com/LemmyNet/lemmy-ansible/releases/tag/1.5.6"
          target="_blank"
          rel="noopener noreferrer"
        >
          lemmy-ansible config
        </a>
        , which correctly configures Nginx. Make sure you’re running at least{" "}
        <code>lemmy-ansible 1.5.6</code>, as earlier versions lacked streaming
        support.
      </p>
      <p>
        If you have to use a custom Nginx setup, check the troubleshooting steps
        below.
      </p>
      <h3>Error: Failed to fetch</h3>
      <p>
        This usually means a CORS misconfiguration, likely at the reverse proxy.
        Open your browser’s network tab to inspect the request headers and
        compare them to a properly working instance.
      </p>
      <h3>Error: HTTP range requests not supported</h3>
      <p>
        Check with <code>curl</code> using a valid pictrs image, like this
        example for lemm.ee:
      </p>
      <pre>
        <code>
          curl -I -H "Range: bytes=0-1"
          https://lemm.ee/pictrs/image/da54d1e7-9f78-47f8-a04f-b73e20b86fb2.png
        </code>
      </pre>
      <blockquote>
        ℹ️ <strong>Note:</strong> You may have to bust the cache if you make
        changes (especially if you use Cloudflare) by appending a random query
        parameter like <code>?t=1234567</code> to the url.
      </blockquote>
      <p>
        <strong>Expected:</strong> A <code>206</code> response with{" "}
        <code>Content-Length: 2</code>.
      </p>{" "}
      <p>
        <strong>Incorrect:</strong> A <code>200</code> response, meaning the
        server is ignoring partial requests, breaking video streaming. This
        usually indicates improper reverse proxy settings. You may need to
        enable the Nginx slice module—
        <a
          href="https://github.com/LemmyNet/lemmy-ansible/pull/259/files"
          target="_blank"
          rel="noopener noreferrer"
        >
          as seen here in lemmy-ansible
        </a>
        . Check the{" "}
        <a
          href="https://nginx.org/en/docs/http/ngx_http_slice_module.html"
          target="_blank"
          rel="noopener noreferrer"
        >
          <code>ngx_http_slice_module</code> docs
        </a>{" "}
        for more details.
      </p>
      <h2>Instance results</h2>
      <table>
        <thead>
          <tr>
            <th>Instance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <CustomInstance />
          {instances.length ? (
            instances.map((instance) => (
              <Instance instance={instance} key={instance} />
            ))
          ) : (
            <tr>
              <td colSpan={2}>Loading...</td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

export default App;
