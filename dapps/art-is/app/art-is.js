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

var COST_TO_CHANGE = [];

var DEFINITION_COUNT = 8;

var EXTENT = ["",
              "good because it is", "bad because it is", "moral because it is",
              "immoral because it is", "creepy because it is",
              "paradoxically", "slightly", "somewhat", "very", "totally",
              "always", "never", "sometimes", "occasionally", "often",
              "unavoidable because it is", "unfortunate because it is",
              "valuable because it is", "worthless because it is",
              "ridiculous because it is",
              "a valuable asset class because it is", "arguably", "inarguably",
              "tendentiously", "rebarbatively", "elsewhere", "everywhere",
              "nowhere", "seen to be", "seemingly",
              "determined by the fact that it is"
              ];

var CONNECTION = ["",
                  "not", "ontologically", "epistemologically", "logically",
                  "psychologically",
                  "childishly", "sophisticatedly", "conservatively",
                  "liberally", "ironically",
                  "creepily", "radically", "queerly", "problematically",
                  "neoliberally",
                  "otiosely", "maybe", "possibly", "extensively", "critically",
                  "superstructurally", "genetically", "contingently",
                  "deterministically", "cybernetically",
                  "systemically", "institutionally", "obviously", "obliquely",
                  "tragically", "joyously"
                 ];

var RELATION = ["",
                "reliant on", "derivative of", "determined by", "defined by",
                "subservient to",
                "reacting to", "commenting on", "embracing", "resolving",
                "transcending",
                "valenced by", "critiquing", "attacking", "destroying",
                "obviating",
                "leavened by", "ironising", "complicit in", "captured by",
                "building on",
                "extending", "subsuming", "subsumed by", "supportive of",
                "remixing",
                "detourning", "queering", "deconstructing", "interrogating",
                "commenting on", "a correlate of"
               ];

var SUBJECT = ["everything",
               "techne", "society", "politics", "materiality", "identity",
               "emotion", "critique", "aesthetics", "god", "satan",
               "beauty", "horror", "desire", "gender", "revolution",
               "economics", "spirituality", "nothing", "fascism",
               "communism", "the Internet", "nature", "the Anthropocene",
               "the world", "the past", "the future", "the present", "eternity",
               "hyperstition"];

var TOGGLE_ACCOUNT_SELECTOR = '.dapp-modal-container .dapp-select-account';

var setDefinitionFromStruct = function (index, struct) {
  var definitions = Session.get('definitions');
  definitions[index]['extent'] = struct[0].toNumber();
  definitions[index]['connection'] = struct[1].toNumber();
  definitions[index]['relation'] = struct[2].toNumber();
  definitions[index]['subject'] = struct[3].toNumber();
  definitions[index]['setter'] = struct[4].toString();
  // Store the new status in local storage, updating the UI as a result
  // Since we mutate definitions this slightly superfluous, flag instead?
  Session.set('definitions', definitions);
};

var setDefinitionFromStructCreator = function (index) {
  return function (struct) {
    setDefinitionFromStruct (index, struct);
  };
}

/*var setDefinitionFromEvent = function (event) {
  var definitions = Session.get('definitions');
  console.log(definition);
  var index = event[0].toNumber();
  definitions[index]['extent'] = event[1].toNumber();
  definitions[index]['connection'] = event[2].toNumber();
  definitions[index]['relation'] = event[3].toNumber();
  definitions[index]['subject'] = event[4].toNumber();
  definitions[index]['setter'] = event[5].toString();
  // Store the new status in local storage, updating the UI as a result
  // Since we mutate definitions this slightly superfluous, flag instead?
  Session.set('definitions', definitions);
};*/

if (Meteor.isClient) {

  Template.registerHelper('costToChange', function(index) {
    return COST_TO_CHANGE[index];
  });

  Template.registerHelper('extents', function () {
    return EXTENT;
  });

  Template.registerHelper('lookupExtent', function (index) {
    return EXTENT[index];
  });

  Template.registerHelper('connections', function () {
    return CONNECTION;
  });

  Template.registerHelper('lookupConnection', function (index) {
    return CONNECTION[index];
  });

  Template.registerHelper('relations', function () {
    return RELATION;
  });

  Template.registerHelper('lookupRelation', function (index) {
    return RELATION[index];
  });

  Template.registerHelper('subjects', function () {
    return SUBJECT;
  });

  Template.registerHelper('lookupSubject', function (index) {
    return SUBJECT[index];
  });

  Template.art_is.helpers({
    definitions: function () {
      return Session.get('definitions');
    }
  });

  // Keep track of when we're updating the contract state on the blockchain
  // and don't show the update dialog during that time so the user doesn't
  // waste gas trying to change it again.
  var updating = false;

  Template.edit_definition.events({
    'click': function(){
      if (! updating) {
        EthElements.Modal.question({
          template: 'toggle_art_is',
          data: {
            my_accounts: EthAccounts.find().fetch()
          },
          ok: function(){
            updating = true;
            var art_is = ArtIs.deployed();
            // Update the state on the blockchain
            var account = TemplateVar.getFrom(TOGGLE_ACCOUNT_SELECTOR, 'value');
            art_is.setDefinition({ from: account }).catch(function(e) {
              console.log(e);
              alert("Error sending toggling; see log.");
            });
          },
          cancel: true
        });
      }
    }
  });

  // Why do we put this inside window.onload?
  // Truffle adds init code *after* this file is inlined, so we can't access
  //   ArtIs.deployed here as it doesn't exist until the init code is called.
  window.onload = function() {

    EthAccounts.init();

    var art_is = ArtIs.deployed();

    // Store the initial definitions state
    var definitions = Array();
    for (var i = 0; i < DEFINITION_COUNT; i++) {
      definitions[i] = {index:i};
    }
    Session.set('definitions', definitions);
    for (var i = 0; i < DEFINITION_COUNT; i++) {
      var setDefinition = setDefinitionFromStructCreator (i);
      art_is.definitions(i).then(setDefinition);
    }

    // When a definition changes, update value in session and thereby UI
    // If this shows the usual > 1 arg problem, that's fine the index is 1
    // so get that and fetch the actual values
    art_is.DefinitionChanged({}, function(error, result){
      if (! error) {
        setDefinition(result);
        /*var index = result[0].toNumber();
          art_is.definitions(index).then(function (definition) {
          setDefinition(index, definition);
          });*/
      }
    });
  };
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
