var scheduler = {};

scheduler.types = {
	REPEAT: 'repeat',
	SCHEDULE: 'everyX',
	ONCE: 'once'
};

scheduler.utils = {
	getSimpleDay: function getSimpleDay(){
		var d = new Date();
		d.setHours(0);
		d.setMinutes(0);
		d.setMilliseconds(0);
		d.setSeconds(0);
		return d;
	},

	get24Hours: function get24Hours(){
		return 24*60*60*1000;
	},

	getDifference: function(time){
		var now = Date.now();
		var today = scheduler.utils.getSimpleDay().getTime();
		if(now > today+time){
			// time to schedule has passed, 
			// we return time for tomorrow
			var tomorrow = today + scheduler.utils.get24Hours();
			return tomorrow + time;
		} else {
			return (today+time) - now;
		}
	},

	UUID: function(){
		function s4(){
			return ((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}

		return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
	},
};

scheduler.schedule = {
	every: function(time){
		var s = new Scheduler(scheduler.types.SCHEDULE);
		s.setX(time);
		return {
			for: (function(sch){
				return function(fun){
					sch.setFunction(fun);

					var res = {
						starting: function(time){
							if(time === 'now' || time === 0){
								time = Date.now() - scheduler.utils.getSimpleDay().getTime();
								sch.setTime(time).launch();
								return sch;
							}
							var t = time + Date.now() - scheduler.utils.getSimpleDay().getTime();
							return sch.setTime(t);
						}
					};

					res.starting.at = function(time){
						return sch.setTime(time);
					};

					res.starting.in = res.starting;

					return res;
				}
			})(s)
		};
	}
};

scheduler.schedule.every.hour = function(time, fun){
	var s = new Scheduler(scheduler.types.SCHEDULE, time, fun);
	return s.setX(1000 * 3600);
};

scheduler.schedule.every.day = {
	at:function(time, fun){
		var s = new Scheduler(scheduler.types.SCHEDULE, time, fun);
		return s.setX(1000 * 3600 * 24);
	},
};

scheduler.schedule.every.week = function (time, fun){
	var s = new Scheduler(scheduler.types.SCHEDULE, time, fun);
	return s.setX(1000 * 3600 * 24 * 7);
};

scheduler.repeat = {
	every: function(time){
		var s = new Scheduler(scheduler.types.REPEAT, time);
		return {
			for: (function(scheduler){
				return function(fun){
					return scheduler.setFunction(fun);
				}
			})(s)
		}
	}
};

scheduler.once = function(time, fun){

};

class Scheduler {
	constructor(type, time, fun, launch){
		this.__id = scheduler.utils.UUID();
		this.__type = type;

		time = ((time instanceof Date) || (time instanceof SchedulerDate)) ? time.getTime() : time;
		this.time = time;
		this.__function = fun;
		if(launch === true){
			this.launch();
		}

		this.__iteration = -1;
		this.__totalTime = 0;
		this.__timeSinceLaunch = 0;
	}

	launch(){
		if((typeof this.__function === 'undefined') || !(this.__function instanceof Function)){
			throw new Error('Scheduler only accepts functions as runnables. Change it by using Scheduler.setFunction(fun)');
		}

		if(this.__type === 'repeat'){
			// repeats every this.__time
			var parent = this;
			this.__interval = setInterval(function(){		
				parent.__count();

				parent.__function({
					i:parent.__iteration,
					time: parent.__timeSinceLaunch,
				});
			}, this.time);

		} else if(this.__type === 'everyX'){
			// repeats every X time at given time
			var parent = this;

			var diff = scheduler.utils.getDifference(this.time);
			setTimeout(function(){
				parent.__count();
				parent.__function({
					i:parent.__iteration,
					time: parent.__timeSinceLaunch,
				});
				parent.__interval = setInterval(function(){
					parent.__count();

					parent.__function({
						i:parent.__iteration,
						time: parent.__timeSinceLaunch,
					});
				}, parent.__timeX);
			}, diff);

		} else if(this.__type === 'once'){
			// the same as setTimeout
			// utility: launch function;
			var parent = this;
			this.__interval = setTimeout(function(){		
				parent.__count();

				parent.__function({
					i:parent.__iteration,
					time: parent.__timeSinceLaunch,
				});
			}, this.time)
		} else {
			throw new Error('Type of scheduler not known: ', this.__type);
		}
	}

	stop(){
		try{
			if(this.__type === 'once'){
				clearTimeout(this.__interval);
			} else {
				clearInterval(this.__interval);
			}
			return true;
		} catch(e) {
			console.error('Could not stop scheduler:', e);
			return false;
		} 
	}

	__count(){
		this.__iteration++;
		this.__timeSinceLaunch = (this.__iteration+1) * this.__timeX;
		this.__totalTime = this.__timeSinceLaunch + this.time;
	}

	setFunction(fun){
		this.__function = fun;
		return this;
	}

	setTime(time){
		time = ((time instanceof Date) || (time instanceof SchedulerDate)) ? time.getTime() : time;
		this.time = time;
		return this;
	}

	setType(type){
		this.__type = type;
		return this;
	}

	setX(time){
		time = ((time instanceof Date) || (time instanceof SchedulerDate)) ? time.getTime() : time;
		this.__timeX = time;
		return this;
	}

	stopAfter(params){
		if(Object.keys(params).length > 1){
			throw new Error('params can only have 1 key, time or clicks');
		}


	}
}
Scheduler.prototype.clear = Scheduler.prototype.stop;


class SchedulerDate{
	constructor(time){
		this.id = Date.now() + (Math.floor(Math.random() * 100000));
		if(time === true){
			this.date = new Date(0);
		} else {
			try{
				this.date = new Date(time);	
			} catch(e) {
				throw new Error('Time must be set so that a new Date can be created with it using new Date(time)');
			}
		}
	}

	milliseconds(time){
		this.date.setMilliseconds(time);
		return this;
	}

	seconds(time){
		this.date.setSeconds(time);
		return this;		
	}

	minutes(time){
		this.date.setMinutes(time);
		return this;
	}

	hours(time){
		this.date.setHours(time);
		return this;
	}

	days(time){
		this.date.setDate(time);
		return this;
	}

	months(time){
		this.date.setMonth(time);
		return this;
	}

	years(time){
		this.date.setYear(time);
		return this;
	}

	getTime(){
		return this.date.getTime();
	}

	toString(){
		return this.date.getTime();
	}

	toJSON(){
		return {
			time: this.date.getTime(),
			id: this.id
		};
	}
}

SchedulerDate.new = function(){
	return new SchedulerDate(true);
};

Scheduler.Date = SchedulerDate;

SchedulerDate.prototype.ms = SchedulerDate.prototype.milliseconds;
SchedulerDate.prototype.s = SchedulerDate.prototype.seconds;
SchedulerDate.prototype.m = SchedulerDate.prototype.minutes;
SchedulerDate.prototype.h = SchedulerDate.prototype.hours;
SchedulerDate.prototype.D = SchedulerDate.prototype.days;
SchedulerDate.prototype.M = SchedulerDate.prototype.months;
SchedulerDate.prototype.Y = SchedulerDate.prototype.years;

module.exports = scheduler;