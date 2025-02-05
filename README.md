# Dallas Election Watch

# TODOs
1. ~~generate the date ranges in the Profile component~~
2. ~~pipe the date ranges through necessary child components~~
3. ~~populate dropdowns with these date ranges~~
4. ~~display the number of addresses that are missing due to malformed address entries~~
5. ~~find the city council shapefiles for san antonio~~
6. ~~generate san antonio maps using python scripts~~
7. ~~get the search input working~~
    - ~~want to be able to filter by name, city, and district~~
8. create links to candidate content
    - campaign website
    - twitter
    - profile page from the city website
9. ~~create a simple homepage~~
    - ~~Texas Campaign Finance Directory~~
    - ~~Texas imagery (use national bird?)~~
    - ~~Give users directions~~
10. ~~replace the icon in the nav window~~
11. ~~Replace dallas city council photos with ones that are all the same size~~
12. ~~Create a 'Find Your Council Member' button for each city that gets onboarded~~
13. ~~Wrap the content in each li in the nav window content so we don't cut off the text~~
14. ~~Fonts got messed up due to changes to the Header js/css files; fix that~~
15. ~~Pass down the selected-Date-Range as prop to all components so we only select date once and ALL components react~~
16. See about onboarding Waco, Denton, Marfa, Fredericksburg.
17. ~~Add "Data Source" and "Find My District" values to the yaml config~~
18. Revisit the above-limit code; rules should be able to be set for specific election cycles
19. ~~Round the "Amount" column in agg contribution table~~
20. ~~Relegate the Highlights section to stats viewed through an ethical lens~~
21. ~~Create a Legality themed section that provides stats through the lens of election campfin law~~
22. ~~Manage the differences between date formats and use the yaml file election_span field to handle 2yr vs 4yr elections~~
23. ~~Election cycles in Austin cycles are ireggular, so maybe we should create a yaml config to handle the election cycles. This would give us more control over handling runoff elections per candidate~~
24. ~~Create city-wide data aggregations that we can display via components on the home page~~

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
