/*  ArtIs - Ethereum contract to define art.
    Copyright (C) 2015, 2016  Rob Myers <rob@robmyers.org>

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

contract ArtIs {

    event DefinitionChanged(uint8 number, uint8 extent, uint8 connection,
                            uint8 relation, uint8 subject, address setter);

    uint8 constant NUM_TERMS = 32;

    struct Definition {
        uint8 extent;
        uint8 connection;
        uint8 relation;
        uint8 subject;
        address setter;
    }

    Definition[8] public definitions;

    function indexPrice (uint8 index) returns (uint price) {
        uint[8] memory prices;
        // We don't have array initializers yet, so slow and steady...
        prices[0] = 1 wei;
        prices[1] = 1 szabo;
        prices[2] = 1 finney;
        prices[3] = 1 ether;
        prices[4] = 10 ether;
        prices[5] = 100 ether;
        prices[6] = 1000 ether;
        prices[7] = 10000 ether;
        return prices[index];
    }

    function initialValue (uint8 definition) returns (uint8 value) {
        value = definition;
    }

    function initDefinition (uint8 index) private
        returns (Definition definition) {
        definition = Definition({extent: initialValue(index),
                    connection: initialValue(index),
                    relation: initialValue(index),
                    subject: initialValue(index),
                    setter: tx.origin});
    }

    function ArtIs () {
        for (uint8 i = 0; i < definitions.length; i++) {
            definitions[i] = initDefinition(i);
        }
    }

    function setDefinition (uint8 index, uint8 extent, uint8 connection,
                            uint8 relation, uint8 subject) {
        // Make sure all the values are valid
        if ((index < definitions.length) &&
            (msg.value == indexPrice(index))
            && (extent < NUM_TERMS)
            && (connection < NUM_TERMS)
            && (relation < NUM_TERMS)
            && (subject < NUM_TERMS)) {
            // We send payment to the previous setter, so get their address
            address refund_to = definitions[index].setter;
            definitions[index].extent = extent;
            definitions[index].connection = connection;
            definitions[index].relation = relation;
            definitions[index].subject = subject;
            definitions[index].setter = tx.origin;
            if (! refund_to.send(indexPrice(index))) {
                throw;
            }
            DefinitionChanged(index, extent, connection, relation, subject,
                              tx.origin);
        }
    }
}
