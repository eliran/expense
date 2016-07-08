describe('Navigation Controller', function(){
  var ctrl, $location

  beforeEach(module('expenseApp'))
  beforeEach(module(function($provide){
    $provide.value('SessionService', mockSessionService)
  }))

  beforeEach(inject(function($controller, _$location_){
    $location = _$location_
    ctrl = $controller('NavController')
  }))

  it('#isLoggedIn(): false', function(){
    mockSessionService.loggedOut()
    expect(ctrl.isLoggedIn()).to.be.false 
  })

  it('#isLoggedIn(): true', function(){
    mockSessionService._loggedIn()
    expect(ctrl.isLoggedIn()).to.be.true
  })

  it('should return #currentUser', function(){
    mockSessionService._loggedIn({ firstName: 'name' })
    expect(ctrl.currentUser().firstName).to.equal('name')
  })

  it('should be able to logout', function(){
    mockSessionService._loggedIn()
    ctrl.logout()
    expect(mockSessionService.isLoggedIn()).to.be.false
    expect($location.url()).to.equal('/') 
  })

})