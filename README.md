# 🤔 Does my Lemmy instance support video streaming?

> [!NOTE]
> [CLICK HERE to check the list](https://aeharding.github.io/lemmy-streaming/)

---

Many Lemmy instances are misconfigured, which can break progressive video streaming and even basic image loading in strange ways. The latest default lemmy-ansible config handles this correctly, but many instances use custom proxy setups that cause issues. This tool will check that:

- ✅ The instance supports [HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests) for proper video streaming
- ✅ CORS headers are properly set for API and pictrs media

## I'm a user, my instance is on this list!

This may be why you sometimes see broken videos. If your instance is shown as broken on this list, please inform the admins!

Also, Lemmy often hotlinks to media on other instances. So, even if you have an account on a properly configured instance, other instances may still cause problems for you!

## I'm an admin, how do I fix this?

**The simplest fix:** Use the latest [lemmy-ansible config](https://github.com/LemmyNet/lemmy-ansible/releases/tag/1.5.6), which correctly configures Nginx. Make sure you’re running at least `lemmy-ansible 1.5.6`, as earlier versions lacked streaming support.

If you have to use a custom Nginx setup, check the troubleshooting steps below.

### Error: Failed to fetch

This usually means a CORS misconfiguration, likely at the reverse proxy. Open your browser’s network tab to inspect the request headers and compare them to a properly working instance.

### Error: HTTP range requests not supported

Check with `curl` using a valid pictrs image, like this example for lemm.ee:

```sh
curl -I -H "Range: bytes=0-1" https://lemm.ee/pictrs/image/da54d1e7-9f78-47f8-a04f-b73e20b86fb2.png
```

> ℹ️ **Note:** You may have to bust the cache if you make changes (especially if you use Cloudflare) by appending a random query parameter like `?t=1234567` to the URL.

**Expected:** A `206` response with two bytes payload.

**Incorrect:** A `200` response, meaning the server is ignoring partial requests, breaking video streaming. This usually indicates improper reverse proxy settings. You may need to enable the Nginx slice module—[as seen here in lemmy-ansible](https://github.com/LemmyNet/lemmy-ansible/pull/259/files). Check the [`ngx_http_slice_module` docs](https://nginx.org/en/docs/http/ngx_http_slice_module.html) for more details.
