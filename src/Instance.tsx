import { useEffect, useState } from "react";

type Result =
  | {
      type: "init";
    }
  | {
      type: "loading";
    }
  | {
      type: "success";
      result: string;
    }
  | {
      type: "error";
      error: string;
    };

export default function Instance({ instance }: { instance: string }) {
  const [result, setResult] = useState<Result>({ type: "init" });

  useEffect(() => {
    if (result.type === "loading") return;

    onLoad();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onLoad() {
    isSiteStreamingCapable(instance)
      .then((result) => {
        setResult({ type: "success", result });
      })
      .catch((error) => {
        setResult({ type: "error", error: error.message });
      });
  }

  return (
    <tr>
      <td>{instance}</td>
      <td>
        <ResultDisplay result={result} />
      </td>
    </tr>
  );
}

function ResultDisplay({ result }: { result: Result }) {
  switch (result.type) {
    case "init":
    case "loading":
      return <div>🔄 Loading...</div>;
    case "success":
      return <div>✅ Success!</div>;
    case "error":
      return <div>❌ Error: {result.error}</div>;
  }
}

async function isSiteStreamingCapable(instance: string) {
  const iconUrl = await getIcon(instance);

  // check if partial request (bytes 0-1) provides 206 response code
  let partialResult;

  // create new params object
  const params = new URLSearchParams(new URL(iconUrl).search);
  params.set("t", `${Math.round(Date.now() / 1_000)}`);
  const cacheBustedIconUrl = `${iconUrl}?${params.toString()}`;

  try {
    partialResult = await fetch(`${cacheBustedIconUrl}`, {
      headers: {
        Range: "bytes=0-1",
      },
    });
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch");
  }

  if (partialResult.status === 404) {
    localStorage.removeItem(`icon-${instance}`);
    throw new Error("404 returned. Maybe cached old icon, please refresh.");
  }

  if (!partialResult.ok) {
    throw new Error("Bad response code for icon fetch");
  }

  if (partialResult.status !== 206) {
    throw new Error("HTTP range requests not supported");
  }

  if ((await partialResult.arrayBuffer()).byteLength !== 2)
    throw new Error("Payload size is not 2 bytes");

  return `Supported`;
}

interface SiteInfo {
  site_view: {
    site: {
      icon: string;
    };
  };
  admins: {
    person: {
      avatar: string;
    };
  }[];
}

async function getIcon(instance: string) {
  const cachedIcon = localStorage.getItem(`icon-${instance}`);

  if (cachedIcon) return cachedIcon;

  let result;
  try {
    result = await fetch(`https://${instance}/api/v3/site`);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch site info");
  }

  if (!result.ok) {
    throw new Error("Bad response code for site info fetch");
  }

  const data: SiteInfo = await result.json();

  const icon =
    data.site_view.site.icon ??
    data.admins.find((admin) => admin.person.avatar)?.person.avatar;

  if (!icon) {
    throw new Error("Site does not have an icon");
  }

  localStorage.setItem(`icon-${instance}`, icon);

  return icon;
}
