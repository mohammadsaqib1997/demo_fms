import firebase from 'firebase'

export default {
    data: function(){
        return {

        }
    },
    methods: {
        logout: function(){
            firebase.auth().signOut();
        }
    }
}