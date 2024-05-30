class PersonalInfo {
    constructor(username, email, phonenum, address) {
        this.username = username;
        this.email = email;
        this.phonenum = phonenum;
        this.address = address;
    }
  }
  
  class PersonalInfoCreator {
    constructor() {
        this.username = null;
        this.email = null;
        this.phonenum = null;
        this.address = null;
    }
  
    setUsername(username) {
        this.username = username;
    }
    setEmail(email) {
        this.email = email;
    }
    setPhonenum(phonenum) {
        this.phonenum = phonenum;
    }
    setAddress(address) {
        this.address = address;
    }
  
    getPersonalInfo() {
      return new PersonalInfo(this.username, this.email, this.phonenum, this.address);
    }
  
    static getCreator() {
      return new PersonalInfoCreator();
    }
  }
  
  export default PersonalInfoCreator.getCreator;
  