# Skedr
====

### Installation
`npm install skedr`

### Usage

Skedr offers a lot of possibilities. First of all, let's review the types of schedulers:
* Repeaters
* Schedulers
* One-time (same as `setTimeout`);

All of these return an object of type `Scheduler`, which has 3 main methods:

* `launch()`:
	Launches the scheduler object, whether to repeat, to schedule or to launch once.

* `stop()` and `clear()`:
	Stops the scheduler from whatever it's doing

* `stopAfter(params)`:
	`params` is a dictionary of one key, that can be whether `time` (in ms) or `clicks`. 

#### Repeaters

Repeaters are functions that repeat programatically, like you would with `setInterval`. However, as they are stored in a `Scheduler` object you can stop and launch them any time.

You instanciate a repeater like so:

`var repeater = Skedr.repeat.every(<time>).for(<function>);`

#### One-time scheduler

One time schedulers behave just like `setTimeout`, however, as they are stored inside a `Scheduler` object, you are free to `.stop()` or `.launch()` it whenever you wish, and it's function will always be stored in it.

`var once = Skedr.once(<time>, <function>);`

#### Schedulers

Schedulers are the real reason this library exists. With them you can schedule functions to execute `in X time`, `at X time and repeat every Y time`.

The library provides a lot of options to instanciate schedulers, but let's start with the most important one:

##### Starting in X minutes
`var scheduler = Skedr.schedule.every(time_in_ms).for(nice_function).starting.in(in_x_minutes);`

##### Starting at 3 PM
`var scheduler = Skedr.schedule.every(time_in_ms).for(nice_function).starting.at(three_pm);`

Both schedulers will have to be launched using `.launch()`.

There are some utility functions to simplify scheduling:

`Skedr.schedule.every.{hour|day|week}(time, function);`

## Dates

Of course, '3:45PM' won't work. So we provide a simple `SchedulerDate` class which allows simple date writing.

`var date = new Skedr.Date()` will instanciate a normal date, holding `now` as the time.

`var date = new Skedr.Date(true)` will instanciate a void date, at time 0;

To write 3:45 PM you just instanciate a date and use the utility functions (`ms`, `s`, `m`, `h`, `D`, `M`, `Y`):

`var PM_3_45 = (new Skedr.Date(true)).h(15).m(45);`

Which allows you to call:
`var scheduler = Skedr.schedule.every(<time_in_ms>).for(<nice_function>).starting.at(PM_3);`