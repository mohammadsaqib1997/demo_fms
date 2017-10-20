import firebase from 'firebase'
import moment from 'moment'
import _ from 'lodash'

import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        const db = firebase.database();
        self.calendarEventsRef = db.ref('/calendar_events');
    },
    mounted: function () {
        let self = this;
        let addEventModel, modSelStartTime, modSelEndTime;
        $.getScript('/vendor/jquery-validation/jquery.validate.min.js', function (data, textStatus, jqxhr) {
            $.getScript('/vendor/fullcalendar/fullcalendar.min.js', function (data, textStatus, jqxhr) {
                $.getScript('/vendor/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js', function (data, textStatus, jqxhr) {
                    addEventModel = $('#addEvent');
                    modSelStartTime = $('#sel_start_time');
                    modSelEndTime = $('#sel_end_time');

                    addEventModel.on('hidden.bs.modal', function (e) {
                        self.editId = null;
                        self.errMsg = '';
                        self.title = '';
                        modSelStartTime.data("DateTimePicker").clear();
                        modSelEndTime.data("DateTimePicker").clear();
                        self.badge_type = 'Meeting';
                        self.validation.reset();
                    });

                    modSelStartTime.datetimepicker().on('dp.change', function (e) {
                        if (e.date) {
                            self.start_time = e.date.toISOString();
                        } else {
                            self.start_time = '';
                        }
                    });
                    modSelEndTime.datetimepicker().on('dp.change', function (e) {
                        if (e.date) {
                            self.end_time = e.date.toISOString();
                        } else {
                            self.end_time = '';
                        }
                    });

                    $('#full-calendar').fullCalendar({
                        buttonIcons: {
                            prev: 'fa fa-chevron-left',
                            next: 'fa fa-chevron-right'
                        },
                        header: {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'month,agendaWeek,agendaDay'
                        },
                        droppable: false,
                        eventClick: function(calEvent, jsEvent, view) {
                            self.editId = calEvent.id;
                            self.title = calEvent.title;
                            self.badge_type = self.data[calEvent.id].badge_type;
                            modSelStartTime.data("DateTimePicker").date(calEvent.start);
                            modSelEndTime.data("DateTimePicker").date(calEvent.end);
                            addEventModel.modal('show');
                        },
                        selectable: true,
                        selectHelper: true,
                        select: function (start, end, allDay) {
                            modSelStartTime.data("DateTimePicker").date(moment(start._d));
                            modSelEndTime.data("DateTimePicker").date(moment(end._d));
                            addEventModel.modal('show');
                        },
                    });

                    self.calendarEventsRef.orderByChild('uid').equalTo(firebase.auth().currentUser.uid).once('value', function (snap) {
                        if(snap.numChildren() > 0){
                            snap.forEach(function (event) {
                                let item = event.val();
                                self.data[event.key] = item;
                                $('#full-calendar').fullCalendar('renderEvent', {
                                    id: event.key,
                                    title: item.title,
                                    start: item.start_time,
                                    end: item.end_time
                                }, true);
                            });
                        }
                    });
                    self.calendarEventsRef.orderByChild('uid').equalTo(firebase.auth().currentUser.uid).on('child_removed', function (snap) {
                        $('#full-calendar').fullCalendar( 'removeEvents', snap.key);
                        delete self.data[snap.key];
                    });
                    self.calendarEventsRef.orderByChild('uid').equalTo(firebase.auth().currentUser.uid).on('child_changed', function (snap) {
                        let item = snap.val();
                        self.data[snap.key] = item;
                        $('#full-calendar').fullCalendar('removeEvents', snap.key);
                        $('#full-calendar').fullCalendar('renderEvent', {
                            id: snap.key,
                            title: item.title,
                            start: item.start_time,
                            end: item.end_time
                        }, true);
                    });
                });
            });
        });
    },
    data: function () {
        return {
            inProcess: false,
            editId: null,
            errMsg: '',
            title: '',
            start_time: '',
            end_time: '',
            badge_type: 'Meeting',
            calendarEventsRef: null,
            data: {},
            checkSaveEvent: false
        }
    },
    validators: {
        title: function (value) {
            return Validator.value(value).required().lengthBetween(3, 50);
        },
        start_time: function (value) {
            let msg = 'Invalid Date!';
            return Validator.value(value).required().maxLength(30, msg);
        },
        end_time: function (value) {
            let msg = 'Invalid Date!';
            return Validator.value(value).required().maxLength(30, msg);
        },
        badge_type: function (value) {
            return Validator.value(value).required().in(['Meeting', 'Reminder', 'Event'], 'Invalid Event Select!');
        },
    },
    methods: {
        addEvent: function () {
            let self = this;
            self.$validate().then(function (success) {
                if (success) {
                    self.inProcess = true;
                    self.errMsg = '';
                    let bw = _.sortBy([self.start_time, self.end_time]);
                    self.calendarEventsRef.push({
                        title: self.title,
                        start_time: bw[0],
                        end_time: bw[1],
                        badge_type: self.badge_type,
                        uid: firebase.auth().currentUser.uid,
                        createdAt: firebase.database.ServerValue.TIMESTAMP
                    }, function (err) {
                        if (err) {
                            self.errMsg = err.message;
                            console.log(err);
                        } else {
                            $('#addEvent').modal('hide');
                        }
                        self.inProcess = false;
                    });
                }
            });
        },
        editEvent: function () {
            let self = this;
            if(self.editId !== null) {
                self.$validate().then(function (success) {
                    if (success) {
                        self.inProcess = true;
                        self.errMsg = '';
                        let bw = _.sortBy([self.start_time, self.end_time]);
                        self.calendarEventsRef.child(self.editId).update({
                            title: self.title,
                            start_time: bw[0],
                            end_time: bw[1],
                            badge_type: self.badge_type,
                            uid: firebase.auth().currentUser.uid
                        }, function (err) {
                            if (err) {
                                self.errMsg = err.message;
                                console.log(err);
                            } else {
                                $('#addEvent').modal('hide');
                            }
                            self.inProcess = false;
                        });
                    }
                });
            }
        },
        removeEvent: function () {
            let self = this;
            if(self.editId !== null){
                self.inProcess = true;
                self.calendarEventsRef.child(self.editId).remove(function (err) {
                    if(err){
                        self.errMsg = err.message;
                        console.log(err);
                    }else{
                        $('#addEvent').modal('hide');
                    }
                    self.inProcess = false;
                });
            }
        }
    }
}
