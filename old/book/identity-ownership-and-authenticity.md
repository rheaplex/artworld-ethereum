# Digital Art as Smart Property

There are three cases of digital art as smart property. The first is the conceptual or code art case, where the code of the contract itself is or contains the artwork. The second is the Ethereum storage case, where a small digital artwork is stored in the Ethereum datastore. The third is the stored identifier case, where only an identifier or proxy for the artwork is stored with the contract.

## Conceptual or Code Art

Contracts that are themselves art are a simple case. They should store their owner's Ethereum address and ensure that transactions initiating actions that only the owner should be able to perform come from that address. 

[example]

## Stored Digital Art

[example]

## Stored Identifiers

Where a work of digital art will not fit in the blockchain a more compact identifier must be stored in the contract and used to refer to the work instead.

Ideally a method for identifying unique instances of a digital artwork will be:

1. Stable. The identifier should be usable for decades. Web URLs for example can change or become inaccessible as services change how they serve content or go out of business.
2. Verifiable. The identifier should be usable as a way of verifying that a resource is the one it refers to. Cryptographic hashes for example will not work with digital images that have been resized or GPS co-ordinates that differ even fractionally.
3. Amendable. Where stability fails or a change in ownership requires a change in identifier, it should be possible to update the identifier in a trusted and verifiable way.
4. Sufficient. The information required to identify the resource should be usable directly from the contract rather than requiring external information to complete it.
5. Private. An identifier should leak as little information about the owner of the resource as possible. For example GPS co-ordinates or street addresses, while stable, do locate the resource and possibly its owner. Storing only the cryptographic hash of an identifier can mitigate this.

Some of these criteria clash and therefore any given method of identification must trade them off against each other. For example being private and verifiable, or stable and amendable.

For artworks to interact with smart contracts we need a way of identifying them in those contracts.Where a digital artwork is too large or complex to keep in the contract's code or storage, a proxy or compact identifier that refers to the must be used.

The following identifiers have various strengths and weaknesses.

### URL

A URL, such as a web site address, is a clear public identifier. It lacks privacy and is only as stable as the service hosting it, but has the advantage of being unique. To add a veneer of privacy, only the cryptographic hash of the URL can be stored by the contract and this can be checked against the hash of a URL by anyone who wishes to check whether it is the instance of the work referred to by the contract.

For example the url:

http://robmyers.org/wp-content/uploads/2012/10/applied_aesthetics-824x1024.png

has the SHA256 hash:

6a1811d79b46ab9e43f449beb9838e21dc5865d293e3dfb9b4ba508c7261b915

Never use a link shortening service or a consumer third party hosting service for work represented as URLs, such services are likely to go out of business or change their URL structure, rendering identifiers using them useless. When using your own site for hosting work make sure both to both keep your domain name registered and the server running and to make provisions for them to be maintained when you are no longer able or willing to do so.

### File Hash

Producing a cryptographic hash of a work contained in or represented by a file is simple and uniquely identifies the data contained by the file (although any copies of the file will have the same hash). It is better to hash the contents of the file rather than the file itself: an image that has the same pixel values as a PNG or a GIF will have a very different structure on disk in each of those formats. Likewise the full-size or full-quality version of the contents of the file should be hashed rather than a thumbnail or a lossy version.

TODO:EXAMPLES

### Git Repository Commit Hash

Modern decentralised version control systems use cryptographic hashes to identify commits. Hashes can identify version of works in a series within a version control repository, although they are best accompanied by a URL or other identifier for the repository.

### Serial Number or UUID

A serial number or unique identifier embedded in the work's filename or metadata can be used to identify it. Visible watermarks are the mark of the amateur, and steganographic watermarks are easily defeated. 

### Cryptographic Signing

When producing editions of a digital work, each can be signed by the artist to identify it as authorised.

### Name

When all else fails, a unique name and description for a work is a useful identifier.


# Uniqueness And Alternatives To Ownership

Digital files are easy to distribute and copy. It is best to work with this rather than try to work against it, as the failure of Digital Rights Management (DRM) for music, books and movies shows. DRM doesn't prevent new releases from appearing on filesharing networks almost immediately, it just makes officially purchased media less useful by frustrating consumers.

## Files located at particular URLs



## Editions

"Coloured coins" and shares can be used to identify ownership of members of an edition of works.

## Modified editions

To make editions more desirable, 

## Shares

## Sponsorship

## Pre-sales

## Dedications

## Ownership of the work in a non-physical sense. Not intellectual property, something less restrictive but more profound.


# Authenticating Art

## Certificate Of Authenticity

## Catalogue Raisonne

## Shares In Artworks

## Editions

## SchellingCoin Authentication Committees
