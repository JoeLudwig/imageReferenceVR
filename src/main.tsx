import { AvGadget, AvPanel, AvStandardGrabbable, AvTransform, HighlightType, DefaultLanding, GrabbableStyle, renderAardvarkRoot } from '@aardvarkxr/aardvark-react';
import { EAction, EHand, g_builtinModelBox, InitialInterfaceLock, Av } from '@aardvarkxr/aardvark-shared';
import bind from 'bind-decorator';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ImageAdder } from './imageadder';
import * as IPFS from 'ipfs';

class MenuItem extends React.Component< {displayImage, onClick, deleteSelfCallback}, {}> //class for items on the menu, basically just a button
{
	constructor(props)
	{
		super(props);
	}

	public render()
	{
		return(
			<div className = "imageMenuButtonContainer">
				<button className = "imageMenuButton" onClick = {this.props.onClick}>
					<img src = {this.props.displayImage} className = "imageMenuImage"/>
				</button>
				<button className = "imageMenuDeleteButton" onClick = {this.props.deleteSelfCallback}>X</button>
			</div>
		);
	}
}

interface ImageMenuState
{
	imageUrls: string[];	
}

class ImageMenu extends React.Component< {}, ImageMenuState> //class for the whole menu, basically just renders MenuItems according to list of images
{
	imageToDisplay: string;

	constructor(props)
	{
		super(props);

		this.state =
		{
			imageUrls: [],
		}

		this.imageToDisplay = "";
	}

	@bind
	public onAddImage( url: string )
	{
		this.setState( 
			{
				imageUrls: [ ...this.state.imageUrls, url]
			}
		);
	}

	@bind
	public validateUrl(url:string)
	{
		return(url && !this.state.imageUrls.includes(url) ? true : false)
	}


	public displayImage(image: string) //given to buttons, by setting the image to display we stop drawing the menu and start drawing the image, remove image undoes this, we also force an update here since we dont use state
	{
		this.imageToDisplay = image;
		this.forceUpdate();
	}

	public removeImage()
	{
		this.imageToDisplay = null;
		this.forceUpdate();
	}

	public deleteListItem(item: string)
	{
		this.state.imageUrls.splice(this.state.imageUrls.indexOf(item), 1);
		this.forceUpdate();
	}

	public render()
	{
		if (this.imageToDisplay){ //if theres an image then show that, and also a back button
			return(
				<div>
					<button className = "imageDisplayBackButton" onClick = {() => this.removeImage()}>ᐊ</button>
					<div style = {{textAlign: "center"}}>
						<img className = "displayedImage" src = {this.imageToDisplay}/>	
					</div>
				</div>
			)
		}
		else{ //if there isnt an image selected then show the menu
			if (this.state.imageUrls.length > 0){
				let itemList = this.state.imageUrls.map((image, step) => { //for each image the user has given us, add it to the menu, we use some maths to calculate their position on the grid then pop it in

					let itemStyle = {
						gridColumnStart: ((step%4)+1).toString(),
						gridRowStart: ((Math.floor(step/4))+1).toString()
					};
					return(
					<div style = {itemStyle}> 
						<MenuItem displayImage = {image} onClick = {() => this.displayImage(image)} deleteSelfCallback = {() => this.deleteListItem(image)}/>
					</div> 
					);
				});

				var containerStyle:string = ""; //hopefully will return "15vw 15vw 15vw" with as many 15wvs as nessessary, sets how many rows menu has
				for (var i:number = 0; i < this.state.imageUrls.length/4; i++){
					containerStyle += "20vw ";
				}

				return(
					<div className = "imageMenuContainer" style = {{gridTemplateRows: containerStyle}}>
						{itemList}
					</div>
				);
			}
			else{
				return(
				<div id = "noImageText">
					There are no images here, add some to start!
				</div>
				);
			}
		}
		
	}
}


const k_popupHtml = 
`
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>referenceImageVR popup</title>
	<link href="styles.css" rel="stylesheet">
  </head>

  <body>
    <div id="root" class="FullPage"></div>
  </body>
</html>
`;


class MyGadget extends React.Component< {}, {} >
{
	private addImagePopup: Window = null;
	private imageMenuRef = React.createRef<ImageMenu>();

	constructor( props: any )
	{
		super( props );
	}

	public openWindow(){
		this.addImagePopup = window.open("", "popup", "", true );
		this.addImagePopup.document.write( k_popupHtml );

		ReactDOM.render( <ImageAdder addImageCallback={ this.imageMenuRef?.current.onAddImage } validateUrlCallback={this.imageMenuRef.current.validateUrl}/>, 
			this.addImagePopup.document.getElementById( "root" ) );
	}


	public render()
	{
		return (
			<div className={ "FullPage" } >
				<div>
					<AvStandardGrabbable modelUri={ "models/HandleModel.glb" } modelScale={ 0.8 }
						style={ GrabbableStyle.Gadget }>
						<AvTransform translateY={ 0.21 } >
							<AvPanel interactive={true} widthInMeters={ 0.3 }/>
						</AvTransform>
					</AvStandardGrabbable>
				</div>
				<ImageMenu ref={ this.imageMenuRef }/>
				<button id = "uploadButton" onClick = { () => this.openWindow() }>🗅</button>
			</div> );
	}

}

renderAardvarkRoot( "root", <MyGadget/> );
//DONT FORGET TO RUN NPM START AAAAAAAAAAAAAAAAAAAA YOU ALWAYS FORGETTT
/*
todo:
add ability for remote users?
look into using avmodel to create pop-up images


useful links:
http://localhost:23842/gadgets/aardvark_monitor/index.html
http://localhost:8042/
*/