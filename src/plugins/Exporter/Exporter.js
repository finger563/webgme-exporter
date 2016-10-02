/*globals define*/
/*jshint node:true, browser:true*/

/**
 * Generated by PluginGenerator 1.7.0 from webgme on Thu Aug 25 2016 21:56:12 GMT-0500 (CDT).
 * A plugin that inherits from the PluginBase. To see source code documentation about available
 * properties and methods visit %host%/docs/source/PluginBase.html.
 */

define([
    'plugin/PluginConfig',
    'text!./metadata.json',
    'plugin/PluginBase',
    'common/meta',
    'loader/modelLoader',
    'q'
], function (
    PluginConfig,
    pluginMetadata,
    PluginBase,
    MetaTypes,
    modelLoader,
    Q) {
    'use strict';

    pluginMetadata = JSON.parse(pluginMetadata);

    /**
     * Initializes a new instance of Exporter.
     * @class
     * @augments {PluginBase}
     * @classdesc This class represents the plugin Exporter.
     * @constructor
     */
    var Exporter = function () {
        // Call base class' constructor.
        PluginBase.call(this);
        this.metaTypes = MetaTypes;
        this.pluginMetadata = pluginMetadata;
    };

    /**
     * Metadata associated with the plugin. Contains id, name, version, description, icon, configStructue etc.
     * This is also available at the instance at this.pluginMetadata.
     * @type {object}
     */
    Exporter.metadata = pluginMetadata;

    // Prototypical inheritance from PluginBase.
    Exporter.prototype = Object.create(PluginBase.prototype);
    Exporter.prototype.constructor = Exporter;

    Exporter.prototype.notify = function(level, msg) {
	var self = this;
	var prefix = self.projectId + '::' + self.projectName + '::' + level + '::';
	if (level=='error')
	    self.logger.error(msg);
	else if (level=='debug')
	    self.logger.debug(msg);
	else if (level=='info')
	    self.logger.info(msg);
	else if (level=='warning')
	    self.logger.warn(msg);
	self.createMessage(self.activeNode, msg, level);
	self.sendNotification(prefix+msg);
    };

    /**
     * Main function for the plugin to execute. This will perform the execution.
     * Notes:
     * - Always log with the provided logger.[error,warning,info,debug].
     * - Do NOT put any user interaction logic UI, etc. inside this method.
     * - callback always has to be called even if error happened.
     *
     * @param {function(string, plugin.PluginResult)} callback - the result callback
     */
    Exporter.prototype.main = function (callback) {
        var self = this;
        self.result.success = false;

        self.updateMETA(self.metaTypes);

	// What did the user select for our configuration?
	var currentConfig = self.getCurrentConfig();
	self.modelHash = currentConfig.modelHash;

	var nodeName = self.core.getAttribute(self.activeNode, 'name');
	
	modelLoader.notify = function(level, msg) {self.notify(level, msg);}

	modelLoader.loadModel(self.core, self.activeNode)
	    .then(function(model) {
		return self.blobClient.putFile(nodeName+'.json', JSON.stringify(model.objects, null, 2));
	    })
	    .then(function(hash) {
		self.result.addArtifact(hash);
		self.result.setSuccess(true);
		callback(null, self.result);
	    })
	    .catch(function(err) {
        	self.notify('error', err);
		self.result.setSuccess(false);
		callback(err, self.result);
	    })
		.done();
    };

    return Exporter;
});
