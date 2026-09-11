# Verified Evidence Buffer Hardening v0.1

ORBI TE Studio temporarily retains server-verified evidence bytes only long
enough to build the evidence reports and final TE1 package.

## Limits

- each evidence file remains subject to the existing 20 MB file limit;
- the in-memory verified-evidence registry now has a 100 MB total cap;
- a buffer is tied to the same expiration time as its verification receipt;
- expired buffers are opportunistically pruned before evidence verification and
  package-generation requests;
- successful package generation consumes both receipts and their temporary
  buffers.

If adding a new verified file would push the temporary registry over 100 MB, the
operation fails rather than allowing unbounded memory growth.

## Why this matters

Sequential evidence verification prevents one oversized request body from
containing every project file at once, but previously all verified files could
still accumulate in memory until package generation. The total cap and expiry
policy bound that risk for the local development service.

## Production boundary

This remains an in-memory local-service design. Production should eventually use
streaming or temporary/object storage instead of retaining project evidence
buffers in Node process memory.
