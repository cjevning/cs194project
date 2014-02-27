require 'test_helper'

class CalendarControllerTest < ActionController::TestCase
  test "should get day" do
    get :day
    assert_response :success
  end

end
