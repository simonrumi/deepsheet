import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { toggledShowFilterModal } from '../../actions';

class IconFilter extends Component {
   render() {
      const allClasses =
         'inline-block text-grey-blue hover:text-vibrant-blue pointer ' +
         this.props.classes;
      return (
         <div
            className={allClasses}
            onClick={this.props.onClickFn}
            data-testid={this.props.testId}
         >
            <svg
               style={this.props.style}
               height={this.props.height}
               width={this.props.width}
               viewBox={this.props.viewBox}
               className="fill-current"
               xmlns="http://www.w3.org/2000/svg"
            >
               <path d="m492.476562 0h-471.976562c-11.046875 0-20 8.953125-20 20 0 55.695312 23.875 108.867188 65.503906 145.871094l87.589844 77.851562c15.1875 13.5 23.898438 32.898438 23.898438 53.222656v195.03125c0 15.9375 17.8125 25.492188 31.089843 16.636719l117.996094-78.660156c5.5625-3.710937 8.90625-9.953125 8.90625-16.640625v-116.367188c0-20.324218 8.710937-39.722656 23.898437-53.222656l87.585938-77.851562c41.628906-37.003906 65.503906-90.175782 65.503906-145.871094 0-11.046875-8.953125-20-19.996094-20zm-72.082031 135.972656-87.585937 77.855469c-23.71875 21.085937-37.324219 51.378906-37.324219 83.113281v105.667969l-77.996094 51.996094v-157.660157c0-31.738281-13.605469-62.03125-37.324219-83.117187l-87.585937-77.851563c-28.070313-24.957031-45.988281-59.152343-50.785156-95.980468h429.386719c-4.796876 36.828125-22.710938 71.023437-50.785157 95.976562zm0 0" />
            </svg>
         </div>
      );
   }
}

function mapStateToProps(state, ownProps) {
   return {
      style: ownProps.style || {},
      width: ownProps.width || '100%',
      height: ownProps.height || '100%',
      classes: ownProps.classes || '',
      viewBox: ownProps.viewBox || '0 0 511 511.99982',
      testId: ownProps.testId || '',
      onClickFn: ownProps.onClickFn,
   };
}

export default connect(mapStateToProps)(IconFilter);
