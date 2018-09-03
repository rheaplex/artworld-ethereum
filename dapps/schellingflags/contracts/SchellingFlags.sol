/*  SchellingFlags - Flags as focal points for aesthetics and ideology.
    Copyright (C) 2018  Rhea Myers <rob@Rhea Myers.org>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


pragma solidity ^0.4.21;


import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';


contract SchellingFlags is Ownable {
    // A flag may use a maximum of seven colours
    uint8 constant public MAX_COLORS = 7;
    // We have 24 color values
    uint8 constant public MAX_COLOR_VALUE = 23;
    // We keep an array of the 20 most popular flags
    // If we allowed removing pledges we'd need a linked list
    uint8 constant public NUM_MOST_POPULAR = 20;

    struct Flag {
        uint8[MAX_COLORS] colors;
        uint8 layout;
        uint8 overlay;
        uint256 pledges;
    }

    // Make this changeable just in case
    uint256 public numLayoutDesigns;

    // Make this changeable just in case
    uint256 public numOverlayDesigns;

    // Someone pledged to a flag
    event FlagPledge(uint256 id);
    // The pledge updated the list of most popular flags
    event MostPopularChanged(uint256 id);

    // 0 is the invalid flag index, so start with 1
    uint256 public nextId = 1;

    // Flag id number to Flag struct
    mapping(uint256 => Flag) public flags;
    // Flag flag property hash to flag id number
    mapping(uint256 => uint256) public flagIds;
    // Array of flag numbers for Flag structs with the highest pledge counts
    uint256[NUM_MOST_POPULAR] public mostPopularFlags;

    // The lowest pledge count that is in the list of most popular flags
    // (more than one item may have this number of votes)
    uint public mostPopularLowest;

    modifier validLayout (uint8 layout) {
        require (layout < numLayoutDesigns);
        _;
    }

    modifier validOverlay (uint8 overlay) {
        require (overlay < numOverlayDesigns);
        _;
    }
    
    modifier validColors (uint8[MAX_COLORS] colors) {
        bool ok = true;
        for (uint8 i = 0; i < MAX_COLORS; i++) {
            if (colors[i] > MAX_COLOR_VALUE) {
                ok = false;
                break;
            }
        }
        require(ok == true);
        _;
    }

    modifier validFlagId (uint256 id) {
        require(id > 0);
        require(id < nextId);
        _;
    }

    // Struct accessors don't return array members, so get them this way

    function getFlag (uint256 flagId)
        public view
        validFlagId(flagId)
        returns (uint8[MAX_COLORS], uint8, uint8, uint256)
    {
        return (flags[flagId].colors, flags[flagId].layout,
                flags[flagId].overlay, flags[flagId].pledges);
    }

    function getMostPopular () public view returns (uint256[NUM_MOST_POPULAR]) {
        return mostPopularFlags;
    }

    function setNumLayoutDesigns (uint256 newNum) public onlyOwner {
        numLayoutDesigns = newNum;
    }

    function setNumOverlayDesigns (uint256 newNum) public onlyOwner {
        numOverlayDesigns = newNum;
    }

    function hashFlagProperties (uint8 layout, uint8 overlay,
                                 uint8[MAX_COLORS] colors)
        public pure
        validColors(colors)
        returns (uint256)
    {
        return uint256(sha256(abi.encodePacked(layout, overlay, colors)));
    }

    function createFlag(uint8 layout, uint8 overlay, uint8[MAX_COLORS] colors,
                        uint256 hash)
        internal
        returns (uint256)
    {
        uint256 id = nextId;
        nextId += 1;
        flags[id] = Flag(colors, layout, overlay, 0);
        flagIds[hash] = id;
        // Number of pledges is intentionally zero at this point
        return id;
    }

    // This lazily creates flags that do not already exist
    // We could split out creation, identification and voting but this
    // is comparatively robust and the failure mode (getting the colors
    // slightly wrong and creating a duplicate flag) is even more likely if
    // we do split out creation.

    function pledgeToFlagByProperties (uint8 layout, uint8 overlay,
                                       uint8[MAX_COLORS] colors)
        public
        validColors(colors)
        validLayout(layout)
        validOverlay(overlay)
        returns (uint256)
    {
        uint256 hash = hashFlagProperties(layout, overlay, colors);
        uint256 id = flagIds[hash];
        if (id == 0) {
            id = createFlag(layout, overlay, colors, hash);
        }
        pledgeToFlagById(id);
        return id;
    }

    // If you're sure you know a flag's id, save some gas compared to
    // pledgeToFlagByProperties

    function pledgeToFlagById (uint256 id) public validFlagId(id) {
        flags[id].pledges += 1;
        emit FlagPledge(id);
        updateMostPopular(id);
    }
    
    // If the flag has enough pledges to get into the most popular list,
    // insert it.
    // Naive implementation but with some subtleties:
    // - the list is not sorted in pledge count order (this turns out to be
    //   useful for keeping the visual presentation order stable).
    // - one or all of the flags may have mostPopularLowest pledges.
    // Off-chain callers can sort the list based on pledges for each flag.

    function updateMostPopular (uint256 flagId) internal {
        uint256 pledgeCount = flags[flagId].pledges;
        if (pledgeCount > mostPopularLowest) {
            // Check to see if the Flag is already present
            bool alreadyPresent;
            for (uint i = 0; i < mostPopularFlags.length; i++) {
                if (mostPopularFlags[i] == flagId) {
                    alreadyPresent = true;
                    break;
                }
            }
            // If not already present, overwrite (one of) the lowest flags
            if (! alreadyPresent) {
                for (uint j = 0; j < mostPopularFlags.length; j++) {
                    if (flags[mostPopularFlags[j]].pledges ==
                        mostPopularLowest) {
                        mostPopularFlags[j] = flagId;
                        break;
                    }
                }
            }
            // Update the lowest pledge count
            uint newLowest = flags[mostPopularFlags[0]].pledges;
            for (uint k = 1; k < mostPopularFlags.length; k++) {
                if (flags[mostPopularFlags[k]].pledges < newLowest) {
                    newLowest = flags[mostPopularFlags[k]].pledges;
                }
            }
            mostPopularLowest = newLowest;
            if (alreadyPresent) {
                emit MostPopularChanged(i);
            } else {
                emit MostPopularChanged(j);
            }
        }
    }
}
